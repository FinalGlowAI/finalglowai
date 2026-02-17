import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, Plus, X, Send, Clock, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface GlowPost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  user_email?: string;
  glow_count: number;
  has_glowed: boolean;
}

const CommunityPage = () => {
  const { user, subscribed } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<GlowPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!subscribed) {
      toast.error("Upgrade to Pro to access the Glow Community");
      navigate("/profile");
      return;
    }
    fetchPosts();
  }, [user, subscribed]);

  const fetchPosts = async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: postsData, error } = await supabase
        .from("glow_posts")
        .select("*")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get glow counts and user's glows
      const postsWithGlows = await Promise.all(
        (postsData || []).map(async (post) => {
          const { count } = await supabase
            .from("glow_post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          const { data: userGlow } = await supabase
            .from("glow_post_likes")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", user!.id)
            .maybeSingle();

          return {
            ...post,
            glow_count: count || 0,
            has_glowed: !!userGlow,
            user_email: post.user_id === user!.id ? user!.email : undefined,
          };
        })
      );

      setPosts(postsWithGlows);
    } catch (error: any) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowUpload(true);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);

    try {
      const ext = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("glow-posts")
        .upload(fileName, selectedFile, { contentType: selectedFile.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("glow-posts")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("glow_posts").insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        caption: caption.trim() || null,
        storage_path: fileName,
      });

      if (insertError) throw insertError;

      toast.success("Your glow is live! ✨");
      setShowUpload(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleGlow = async (postId: string, hasGlowed: boolean) => {
    if (!user) return;

    try {
      if (hasGlowed) {
        await supabase
          .from("glow_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("glow_post_likes")
          .insert({ post_id: postId, user_id: user.id });
      }
      fetchPosts();
    } catch {
      toast.error("Failed to update glow");
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getTimeRemaining = (dateStr: string) => {
    const expiresAt = new Date(dateStr).getTime() + 24 * 60 * 60 * 1000;
    const remaining = expiresAt - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (!user || !subscribed) return null;

  return (
    <div className="min-h-screen bg-background pb-24 safe-top">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">
              Glow Community
            </h1>
            <p className="font-body text-xs text-muted-foreground">
              Share your glow of the day ✨
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shadow-lg shadow-gold/20"
          >
            <Plus size={20} className="text-foreground" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setCaption("");
                }}
              >
                <X size={24} className="text-foreground" />
              </button>
              <h2 className="font-display text-lg font-semibold text-foreground">
                New Glow
              </h2>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 rounded-full gradient-gold font-body text-sm font-medium text-foreground disabled:opacity-50 flex items-center gap-1"
              >
                {uploading ? "Posting…" : "Post"}
                <Send size={14} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
              <div className="w-full max-w-sm aspect-square rounded-3xl overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="text"
                placeholder="Add a caption… (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={100}
                className="w-full max-w-sm px-4 py-3 rounded-2xl bg-card border border-border font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="font-body text-sm text-muted-foreground">Loading glows…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
              <ImagePlus size={32} className="text-gold" />
            </div>
            <div className="text-center">
              <h3 className="font-display text-lg font-semibold text-foreground">
                No glows yet
              </h3>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Be the first to share your glow of the day!
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-full gradient-gold font-display text-sm font-medium text-foreground shadow-lg shadow-gold/20 flex items-center gap-2"
            >
              <Camera size={16} />
              Share Your Glow
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                    <Sparkles size={14} className="text-foreground" />
                  </div>
                  <div>
                    <p className="font-body text-xs font-medium text-foreground">
                      {post.user_id === user?.id
                        ? "You"
                        : `Glower`}
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground">
                      {getTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock size={12} />
                  <span className="font-body text-[10px]">
                    {getTimeRemaining(post.created_at)}
                  </span>
                </div>
              </div>

              {/* Post Image */}
              <div className="aspect-square">
                <img
                  src={post.image_url}
                  alt={post.caption || "Glow post"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Post Footer */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleGlow(post.id, post.has_glowed)}
                    className="flex items-center gap-1.5 transition-transform active:scale-90"
                  >
                    <Sparkles
                      size={20}
                      className={
                        post.has_glowed
                          ? "text-gold fill-gold"
                          : "text-muted-foreground"
                      }
                    />
                    <span
                      className={`font-body text-sm ${
                        post.has_glowed
                          ? "text-gold font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {post.glow_count}
                    </span>
                  </button>
                  <span className="font-body text-xs text-muted-foreground">
                    {post.has_glowed ? "You gave a glow ✨" : "Give a glow"}
                  </span>
                </div>
                {post.caption && (
                  <p className="font-body text-sm text-foreground mt-2">
                    {post.caption}
                  </p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
