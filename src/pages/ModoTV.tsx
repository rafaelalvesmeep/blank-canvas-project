import { useState, useEffect, useRef, useCallback } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getSupabaseClient } from "@/integrations/supabase/safeClient";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  MonitorPlay,
  Plus,
  Clock,
  Sparkles,
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
  const [dragOver, setDragOver] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setEnvMissing(true);
      return;
    }

    setSupabaseClient(supabase as unknown as SupabaseClient<Database>);
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

  const processFiles = async (files: FileList | File[]) => {
    if (!supabaseClient) {
      toast({
        title: "Backend indisponível",
        description: "As variáveis do backend ainda não carregaram.",
        variant: "destructive",
      });
      return;
    }

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
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
        variant: "destructive",
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

    if (currentItem.file_type === "image") {
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

      if (e.key === "Escape") {
        exitFullscreen();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, exitFullscreen, nextSlide, prevSlide]);

  const imageCount = mediaItems.filter((m) => m.file_type === "image").length;
  const videoCount = mediaItems.filter((m) => m.file_type === "video").length;

  // Fullscreen slideshow view
  if (isFullscreen && mediaItems.length > 0) {
    const currentItem = mediaItems[currentIndex];

    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={exitFullscreen}
          className="absolute top-6 right-6 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 group"
        >
          <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-6 z-20 p-4 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 z-20 p-4 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-8 w-8" />
        </button>

        {/* Media content */}
        <div className="w-full h-full flex items-center justify-center p-8">
          {currentItem.file_type === "image" ? (
            <img
              key={currentItem.id}
              src={currentItem.file_url}
              alt={currentItem.file_name}
              className="max-w-full max-h-full object-contain animate-fade-in rounded-lg shadow-2xl"
            />
          ) : (
            <video
              key={currentItem.id}
              ref={videoRef}
              src={currentItem.file_url}
              autoPlay
              onEnded={handleVideoEnded}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>

        {/* Progress indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full">
          {mediaItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative transition-all duration-300 ${
                idx === currentIndex ? "scale-125" : "hover:scale-110"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-white shadow-lg shadow-white/50"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
              {idx === currentIndex && item.file_type === "image" && (
                <div className="absolute inset-0 rounded-full animate-ping bg-white/50" />
              )}
            </button>
          ))}
        </div>

        {/* Current slide info */}
        <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-sm font-medium">
          {currentIndex + 1} / {mediaItems.length}
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {envMissing && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                ⚠️ O backend ainda não carregou neste ambiente.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
              <MonitorPlay className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Modo TV
                <Sparkles className="h-5 w-5 text-accent" />
              </h1>
              <p className="text-muted-foreground">
                Gerencie fotos e vídeos para exibição em monitores
              </p>
            </div>
          </div>

          <Button
            onClick={startSlideshow}
            disabled={mediaItems.length === 0}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            <Play className="h-5 w-5" />
            Iniciar Apresentação
          </Button>
        </div>

        {/* Stats */}
        {mediaItems.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
              <ImageIcon className="h-3.5 w-3.5" />
              {imageCount} {imageCount === 1 ? "imagem" : "imagens"}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
              <Video className="h-3.5 w-3.5" />
              {videoCount} {videoCount === 1 ? "vídeo" : "vídeos"}
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
              <Clock className="h-3.5 w-3.5" />
              ~{Math.ceil(imageCount * 10 / 60)} min (imagens)
            </Badge>
          </div>
        )}

        {/* Upload area */}
        <Card
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative overflow-hidden transition-all duration-300 ${
            dragOver
              ? "border-primary border-2 bg-primary/5 scale-[1.01]"
              : "border-dashed border-2 hover:border-primary/50"
          }`}
        >
          <CardContent className="py-12">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div
                className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${
                  dragOver
                    ? "bg-primary/20 scale-110"
                    : "bg-muted group-hover:bg-primary/10"
                }`}
              >
                {uploading ? (
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload
                    className={`h-10 w-10 transition-colors ${
                      dragOver ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                )}
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                {uploading ? "Enviando arquivos..." : "Arraste arquivos aqui"}
              </p>
              <p className="text-muted-foreground text-sm">
                ou clique para selecionar • JPG, PNG, GIF, MP4, WebM
              </p>
            </label>
          </CardContent>

          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        </Card>

        {/* Media grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Mídia na Playlist
            <span className="text-sm font-normal text-muted-foreground">
              ({mediaItems.length} {mediaItems.length === 1 ? "item" : "itens"})
            </span>
          </h2>

          {mediaItems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="p-4 rounded-2xl bg-muted/50 w-fit mx-auto mb-4">
                  <MonitorPlay className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-foreground mb-1">
                  Nenhuma mídia adicionada
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  Faça upload de fotos e vídeos para criar sua apresentação
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Mídia
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mediaItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {item.file_type === "image" ? (
                      <img
                        src={item.file_url}
                        alt={item.file_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <video
                        src={item.file_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between p-3">
                      <p className="text-white text-xs truncate max-w-[70%]">
                        {item.file_name}
                      </p>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-lg"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="bg-black/60 text-white border-0 backdrop-blur-sm gap-1 text-xs"
                      >
                        {item.file_type === "image" ? (
                          <ImageIcon className="h-3 w-3" />
                        ) : (
                          <Video className="h-3 w-3" />
                        )}
                        {index + 1}
                      </Badge>
                    </div>

                    {/* Duration indicator for images */}
                    {item.file_type === "image" && (
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge
                          variant="secondary"
                          className="bg-black/60 text-white border-0 backdrop-blur-sm gap-1 text-xs"
                        >
                          <Clock className="h-3 w-3" />
                          10s
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {/* Add more card */}
              <Card
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video flex items-center justify-center border-dashed border-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
              >
                <div className="text-center">
                  <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mx-auto mb-2">
                    <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Adicionar
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
