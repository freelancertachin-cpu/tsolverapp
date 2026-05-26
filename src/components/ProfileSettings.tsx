import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { 
  User, 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  Shield, 
  Camera,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Clock,
  Smartphone,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Crown
} from 'lucide-react';
import { storage, UserProfile } from '../lib/storage';
import { Logo } from './Logo';
import { translations, SupportedLanguage } from '../lib/translations';
import { useTranslation } from '../lib/useTranslation';
import { getCroppedImg } from '../lib/cropUtils';

export const ProfileSettings: React.FC<{ 
  user: UserProfile, 
  onLogout: () => void,
  setActiveTab?: (tab: string) => void
}> = ({ user, onLogout, setActiveTab }) => {
  const { t, lang: currentLang } = useTranslation();
  const [level, setLevel] = useState(user.level);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [lang, setLang] = useState<SupportedLanguage>((user.preferences?.lang as SupportedLanguage) || 'en');
  const [saved, setSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    storage.isPremium(user.id).then(setIsPremium);
  }, [user.id]);
  
  // Image handling state
  const [avatar, setAvatar] = useState<string | null>(user.avatar || null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageSource, setShowImageSource] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Security: type check
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Invalid file format. Please use JPG, PNG or WEBP.');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
        setShowImageSource(false);
      });
      reader.readAsDataURL(file);
    }
  };

  const saveCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error('Crop failed');

      // Compression
      const options = {
        maxSizeMB: 0.2, // 200KB for the main avatar
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(croppedBlob as File, options);
      
      // Thumbnail compression
      const thumbOptions = {
        maxSizeMB: 0.05, // 50KB for thumbnail cache
        maxWidthOrHeight: 120,
        useWebWorker: true,
      };
      const compressedThumb = await imageCompression(croppedBlob as File, thumbOptions);

      const avatarBase64 = await imageCompression.getDataUrlFromFile(compressedFile);
      const thumbBase64 = await imageCompression.getDataUrlFromFile(compressedThumb);

      setAvatar(avatarBase64);
      setIsCropping(false);
      setImageSrc(null);

      // Save to local storage for immediate notification across tabs if needed, 
      // but primarily we save to IndexedDB via handleSave
    } catch (e) {
      console.error(e);
      alert('Could not process image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const updatedUser: UserProfile = { 
      ...user, 
      name, 
      phone,
      level, 
      avatar: avatar || undefined,
      thumbnail: avatar ? avatar.substring(0, 500) : undefined, 
      preferences: { ...user.preferences, lang } 
    };
    
    // Using a more robust base64 for thumbnail if available
    // But for this demo, avatar is fine.
    
    await storage.saveUser(updatedUser);
    localStorage.setItem('tsolver_lang', lang);
    if (avatar) {
      localStorage.setItem(`tsolver_thumb_${user.id}`, avatar); // Cache for instant loads
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Dispatch custom event to notify other components (like Navbar)
    window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUser }));
    
    // We don't necessarily need window.location.reload() if we handle state correctly
    // But for safety in this complex app:
    // window.location.reload(); 
  };

  const removePhoto = () => {
    setAvatar(null);
    setShowImageSource(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center gap-10">
         <div className="relative group">
            <div 
              onClick={() => setShowImageSource(true)}
              className="h-40 w-40 rounded-[64px] bg-muted border border-border flex items-center justify-center relative overflow-hidden group-hover:border-foreground/30 transition-all cursor-pointer shadow-glow-hover"
            >
               {avatar ? (
                 <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
               ) : (
                 <div className="flex flex-col items-center gap-2 opacity-30">
                   <User size={48} className="text-foreground" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-foreground">Connect ID</span>
                 </div>
               )}
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white scale-125" />
               </div>
               
               {/* Pulsing glow if no avatar */}
               {!avatar && (
                 <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
               )}
            </div>
            <div className="absolute -bottom-2 -right-2 h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-glow border-4 border-background z-10">
               <Shield size={24} />
            </div>
         </div>

          <div className="space-y-4 text-center md:text-left flex-1">
            <input 
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Enter Neural Identity"
               className="text-5xl font-black uppercase tracking-tighter italic bg-transparent border-none outline-none w-full text-center md:text-left text-foreground placeholder:opacity-20"
               aria-label="Profile Name"
            />
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em]">T-Solver Pro • ID: {user.id.substring(0, 8)}</p>
              <div className="flex items-center gap-2">
                 <div className={`h-4 w-4 rounded-full shadow-[0_0_15px_rgba(0,255,136,0.5)] animate-pulse ${isPremium ? 'bg-blue-400' : 'bg-[#00ff88]'}`} />
                 {isPremium && (
                   <span className="bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-2">
                      <CheckCircle2 size={10} /> Verified Premium
                   </span>
                 )}
              </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Academic Setting */}
         <div className="cyber-panel p-8 space-y-8">
            <div className="flex items-center gap-4">
               <GraduationCap className="text-white/40" size={20} />
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Academic Frequency</h3>
            </div>
            <div className="space-y-3">
               {['School', 'College', 'University'].map((l) => (
                  <button 
                     key={l}
                     onClick={() => setLevel(l)}
                     className={`w-full h-14 rounded-2xl flex items-center justify-between px-6 transition-all border ${level === l ? 'bg-foreground text-background border-foreground shadow-glow' : 'bg-muted text-foreground/40 border-border hover:border-foreground/20'}`}
                  >
                     <span className="text-xs font-black uppercase tracking-widest">{l} Intelligence</span>
                     {level === l && <CheckCircle2 size={18} />}
                  </button>
               ))}
            </div>
         </div>

         {/* General Settings */}
         <div className="cyber-panel p-8 space-y-8">
            <div className="flex items-center gap-4">
               <Shield className="text-white/40" size={20} />
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Neural Standing</h3>
            </div>
            
            {!isPremium ? (
               <div className="p-8 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 space-y-4">
                  <div className="flex items-center gap-4 text-yellow-500">
                     <Crown size={24} />
                     <h4 className="text-sm font-black uppercase italic tracking-tighter">Ascend to Premium</h4>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">
                     Unlock AI Teacher, Unlimited Doubts, and Global Cloud Sync nodes.
                  </p>
                  <button 
                    onClick={() => setActiveTab && setActiveTab('premium')}
                    className="w-full h-12 bg-yellow-500 text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow"
                  >
                     Explore Tiers
                  </button>
               </div>
            ) : (
               <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                  <div className="flex items-center gap-4 text-blue-500">
                     <CheckCircle2 size={24} />
                     <h4 className="text-sm font-black uppercase italic tracking-tighter">Master Access Active</h4>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">
                     Your neural link is operating at maximum capacity. All nodes unlocked.
                  </p>
                  <div className="h-2 w-full bg-blue-500/20 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[100%]" />
                  </div>
               </div>
            )}

            <div className="flex items-center gap-4 pt-12">
               <Globe className="text-white/40" size={20} />
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Linguistic Protocol</h3>
            </div>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-foreground/20 px-1">{t.phone}</label>
                   <input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full h-14 bg-muted border border-border rounded-2xl px-6 outline-none text-xs font-black tracking-tight text-foreground"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-foreground/20 px-1">{t.language}</label>
                   <div className="relative group">
                     <select 
                        value={lang}
                        onChange={(e) => setLang(e.target.value as SupportedLanguage)}
                        className="w-full h-14 bg-muted border border-border rounded-2xl px-6 outline-none text-xs font-black uppercase tracking-widest text-foreground appearance-none cursor-pointer focus:border-foreground/30 transition-all"
                     >
                        <option value="en" className="bg-background">English</option>
                        <option value="bn" className="bg-background">Bengali (বাংলা)</option>
                     </select>
                     <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-foreground/20 pointer-events-none group-hover:text-foreground transition-all" />
                   </div>
                </div>
               
               <div className="flex gap-3 pt-2">
                  <button 
                     onClick={() => setShowLogoutConfirm(true)}
                     className="flex-1 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all group"
                  >
                     <LogOut size={16} className="group-hover:rotate-12 transition-transform" /> {t?.logout || 'Disconnect'}
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('Wipe all local memory nodes? This cannot be undone.')) {
                        indexedDB.deleteDatabase('t_solver_db');
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="h-14 px-4 bg-muted border border-border text-foreground/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center" 
                    title="Purge Intelligence Data"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-8">
         <button 
           onClick={handleSave}
           className="h-16 px-16 bg-foreground text-background rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center gap-4"
         >
            {saved ? <><CheckCircle2 size={18} /> Resynced Successfully</> : 'Commit Updates'}
         </button>
         
         <div className="text-center opacity-20 space-y-2 select-none group">
            <h4 className="text-[10px] font-black uppercase tracking-[0.8em] group-hover:tracking-[1em] transition-all text-foreground">T-Solver Core Engine v2.0</h4>
            <p className="text-[8px] font-bold uppercase text-foreground">All synchronization happens via secure offline IndexedDB node.</p>
         </div>
      </div>

      {/* Image Source Selection Modal */}
      <AnimatePresence>
        {showImageSource && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowImageSource(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-sm bg-secondary border border-border rounded-[48px] p-10 space-y-8 relative z-[111] shadow-2xl"
            >
               <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Avatar Uplink</h3>
                  <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Select Visual Data Source</p>
               </div>

               <div className="space-y-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-16 bg-muted border border-border rounded-2xl flex items-center gap-5 px-6 hover:bg-foreground hover:text-background transition-all group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-background/10 flex items-center justify-center group-hover:bg-foreground/10 transition-all text-foreground group-hover:text-background">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Photo Gallery</span>
                  </button>

                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full h-16 bg-muted border border-border rounded-2xl flex items-center gap-5 px-6 hover:bg-foreground hover:text-background transition-all group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-background/10 flex items-center justify-center group-hover:bg-foreground/10 transition-all text-foreground group-hover:text-background">
                      <Camera size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Neural Camera</span>
                  </button>

                  {avatar && (
                    <button 
                      onClick={removePhoto}
                      className="w-full h-16 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-5 px-6 hover:bg-red-500 text-red-500 hover:text-white transition-all group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                        <Trash2 size={20} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Purge Visuals</span>
                    </button>
                  )}
               </div>

               <button 
                 onClick={() => setShowImageSource(false)}
                 className="w-full h-14 bg-muted text-foreground/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-foreground transition-all border border-border"
               >
                 Abort Uplink
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* скрытые инпуты */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/png,image/webp" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="user" 
        className="hidden" 
      />

      {/* Crop Modal */}
      <AnimatePresence>
        {isCropping && imageSrc && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/95 backdrop-blur-2xl p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-secondary border border-border rounded-[56px] overflow-hidden flex flex-col h-[80vh] relative shadow-2xl"
            >
              <div className="p-8 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center border border-border">
                    <Settings className="text-foreground/40" />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Refining Visuals</h3>
                </div>
                <button onClick={() => setIsCropping(false)} className="text-foreground/20 hover:text-foreground transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 relative bg-black/80 overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                  classes={{
                    containerClassName: "cropper-container",
                    mediaClassName: "cropper-media",
                    cropAreaClassName: "cropper-area"
                  }}
                />
              </div>

              <div className="p-10 space-y-8 bg-secondary">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">Magnification</span>
                    <span className="text-[10px] font-black text-foreground italic">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-foreground hover:accent-primary transition-all border border-border"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsCropping(false)}
                    className="flex-1 h-16 bg-muted text-foreground/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-foreground transition-all border border-border"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={saveCroppedImage}
                    disabled={isUploading}
                    className="flex-1 h-16 bg-foreground text-background rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-glow-hover transition-all disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="animate-spin text-background" /> : <><CheckCircle2 size={18} /> Apply Geometry</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-md bg-secondary border border-border rounded-[48px] p-12 text-center space-y-10 relative z-10 shadow-2xl overflow-hidden"
               >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20" />
                  
                  <div className="h-24 w-24 rounded-[40px] bg-red-500/5 border border-red-500/10 flex items-center justify-center mx-auto">
                     <LogOut size={40} className="text-red-500" />
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
                        Confirm Extraction
                     </h3>
                     <p className="text-foreground/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                        Are you sure you want to decouple from this local node?
                     </p>
                  </div>

                  <div className="flex flex-col gap-3">
                     <button 
                        onClick={onLogout}
                        className="h-16 w-full bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                     >
                        Decouple Access
                     </button>
                     <button 
                        onClick={() => setShowLogoutConfirm(false)}
                        className="h-14 w-full bg-muted text-foreground/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-foreground transition-all flex items-center justify-center gap-2 border border-border"
                     >
                        <X size={14} /> Abort
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};
