import { useState, useEffect, useRef, useCallback } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Play,
  Trash2,
  Image as ImageIcon,
  Video,
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  display_order: number;
  created_at: string;
}

export default function ModoTV() {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database> | null>(null);
  const [envMissing, setEnvMissing] = useState(false);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Avoid crashing the whole app if env vars aren't ready
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      setEnvMissing(true);
      return;
    }

    import("@/integrations/supabase/client")
      .then((m) => setSupabaseClient(m.supabase as unknown as SupabaseClient<Database>))
      .catch(() => setEnvMissing(true));
  }, []);

  const fetchMedia = async () => {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
      .from("tv_media")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar mídia",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setMediaItems((data ?? []) as unknown as MediaItem[]);
  };

  useEffect(() => {
    fetchMedia();
  }, [supabaseClient]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!supabaseClient) {
      toast({
        title: "Backend indisponível",
        description: "As variáveis do backend ainda não carregaram. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas imagens e vídeos são permitidos.",
          variant: "destructive",
        });
        continue;
      }

      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("tv-media")
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive",
        });
        continue;
      }

      const { data: urlData } = supabaseClient.storage
        .from("tv-media")
        .getPublicUrl(fileName);

      const maxOrder = mediaItems.length > 0 ? Math.max(...mediaItems.map((m) => m.display_order)) : 0;

      const { error: insertError } = await supabaseClient.from("tv_media").insert({
        file_name: file.name,
        file_type: isImage ? "image" : "video",
        file_url: urlData.publicUrl,
        display_order: maxOrder + 1,
      });

      if (insertError) {
        toast({
          title: "Erro ao salvar",
          description: insertError.message,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    fetchMedia();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast({
      title: "Upload concluído",
      description: "Arquivos enviados com sucesso!",
    });
  };

  const handleDelete = async (item: MediaItem) => {
    if (!supabaseClient) return;

    const fileName = item.file_url.split("/").pop();

    if (fileName) {
      await supabaseClient.storage.from("tv-media").remove([fileName]);
    }

    const { error } = await supabaseClient.from("tv_media").delete().eq("id", item.id);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchMedia();
    toast({
      title: "Excluído",
      description: "Arquivo removido com sucesso.",
    });
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  }, [mediaItems.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  }, [mediaItems.length]);

  const startSlideshow = () => {
    if (mediaItems.length === 0) {
      toast({
        title: "Sem mídia",
        description: "Adicione fotos ou vídeos antes de iniciar.",
        variant: "destructive"
      });
      return;
    }
    setCurrentIndex(0);
    setIsFullscreen(true);
  };

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isFullscreen || mediaItems.length === 0) return;

    const currentItem = mediaItems[currentIndex];
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (currentItem.file_type === 'image') {
      timerRef.current = setTimeout(() => {
        nextSlide();
      }, 10000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isFullscreen, currentIndex, mediaItems, nextSlide]);

  const handleVideoEnded = () => {
    nextSlide();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      if (e.key === 'Escape') {
        exitFullscreen();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen, nextSlide, prevSlide]);

  if (isFullscreen && mediaItems.length > 0) {
    const currentItem = mediaItems[currentIndex];
    
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <button
          onClick={exitFullscreen}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <button
          onClick={prevSlide}
          className="absolute left-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>

        <div className="w-full h-full flex items-center justify-center animate-fade-in">
          {currentItem.file_type === 'image' ? (
            <img
              key={currentItem.id}
              src={currentItem.file_url}
              alt={currentItem.file_name}
              className="max-w-full max-h-full object-contain transition-opacity duration-1000"
            />
          ) : (
            <video
              key={currentItem.id}
              ref={videoRef}
              src={currentItem.file_url}
              autoPlay
              onEnded={handleVideoEnded}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {mediaItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {envMissing && (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">
                O backend ainda não carregou neste ambiente (variáveis VITE_SUPABASE_URL/KEY ausentes). Abra o Preview do editor ou recarregue a página.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Modo TV</h1>
            <p className="text-muted-foreground">
              Gerencie fotos e vídeos para exibição em monitores
            </p>
          </div>
          <Button onClick={startSlideshow} disabled={mediaItems.length === 0}>
            <Maximize className="mr-2 h-4 w-4" />
            Iniciar Apresentação
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Adicionar Mídia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && (
                <span className="text-sm text-muted-foreground">Enviando...</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Formatos aceitos: imagens (JPG, PNG, GIF) e vídeos (MP4, WebM)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mídia Adicionada ({mediaItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {mediaItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma mídia adicionada ainda.</p>
                <p className="text-sm">Faça upload de fotos e vídeos acima.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative group rounded-lg overflow-hidden border bg-muted aspect-video"
                  >
                    {item.file_type === 'image' ? (
                      <img
                        src={item.file_url}
                        alt={item.file_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.file_url}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded px-2 py-1 text-xs text-white">
                      {item.file_type === 'image' ? (
                        <ImageIcon className="h-3 w-3" />
                      ) : (
                        <Video className="h-3 w-3" />
                      )}
                      <span>{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
