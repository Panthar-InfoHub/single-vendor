"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, FileText, Info, ArrowLeft } from "lucide-react";
import { createHeroSlide, updateHeroSlide } from "@/actions/admin/hero-slide.actions";
import { toast } from "sonner";
import type { HeroSlide } from "@/prisma/generated/prisma";
import Image from "next/image";
import { uploadToCloud } from "@/lib/upload-to-cloud";
import Link from "next/link";

interface HeroSlideFormPageProps {
  slide: HeroSlide | null;
}

export function HeroSlideFormPage({ slide }: HeroSlideFormPageProps) {
  const router = useRouter();
  const [slideType, setSlideType] = useState<"IMAGE_ONLY" | "IMAGE_WITH_CONTENT">(
    slide?.slideType || "IMAGE_WITH_CONTENT"
  );
  const [order, setOrder] = useState(slide?.order || 0);
  const [isActive, setIsActive] = useState(slide?.isActive ?? true);
  const [image, setImage] = useState(slide?.image || "");
  const [mobileImage, setMobileImage] = useState(slide?.mobileImage || "");
  const [imageAlt, setImageAlt] = useState(slide?.imageAlt || "");
  const [title, setTitle] = useState(slide?.title || "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle || "");
  const [description, setDescription] = useState(slide?.description || "");
  const [buttonText, setButtonText] = useState(slide?.buttonText || "");
  const [buttonLink, setButtonLink] = useState(slide?.buttonLink || "");

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const result = await uploadToCloud(file, "hero-slides");
      if (result.success && result.url) {
        setImage(result.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingMobile(true);
    setError("");

    try {
      const result = await uploadToCloud(file, "hero-slides/mobile");
      if (result.success && result.url) {
        setMobileImage(result.url);
        toast.success("Mobile image uploaded successfully");
      } else {
        toast.error(result.error || "Failed to upload mobile image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload mobile image");
    } finally {
      setIsUploadingMobile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!image) {
      setError("Image is required");
      return;
    }

    if (slideType === "IMAGE_WITH_CONTENT" && !title) {
      setError("Title is required for slides with content");
      return;
    }

    setIsSaving(true);

    const data = {
      slideType,
      order,
      isActive,
      image,
      mobileImage: mobileImage || undefined,
      imageAlt,
      title: slideType === "IMAGE_WITH_CONTENT" ? title : undefined,
      subtitle: slideType === "IMAGE_WITH_CONTENT" ? subtitle : undefined,
      description: slideType === "IMAGE_WITH_CONTENT" ? description : undefined,
      buttonText: slideType === "IMAGE_WITH_CONTENT" ? buttonText : undefined,
      buttonLink: slideType === "IMAGE_WITH_CONTENT" ? buttonLink : undefined,
    };

    const result = slide ? await updateHeroSlide(slide.id, data) : await createHeroSlide(data);

    if (result.success) {
      toast.success(slide ? "Slide updated successfully" : "Slide created successfully");
      router.push("/admin/hero-slides");
    } else {
      setError(result.error || "Failed to save slide");
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/hero-slides">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{slide ? "Edit Hero Slide" : "Create Hero Slide"}</h1>
          <p className="text-sm text-muted-foreground">
            {slide ? "Update your hero slide details" : "Add a new slide to your homepage carousel"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          {/* Slide Type Selection - Minimal */}
          <div className="space-y-3 mb-6">
            <Label>Slide Type</Label>
            <Tabs
              value={slideType}
              onValueChange={(value) => setSlideType(value as typeof slideType)}
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="IMAGE_WITH_CONTENT" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Image + Content
                </TabsTrigger>
                <TabsTrigger value="IMAGE_ONLY" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image Only
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
              <Info className="h-3 w-3 inline mr-1" />
              {slideType === "IMAGE_WITH_CONTENT" ? (
                <>
                  <strong>Recommended:</strong> 1200×800px (3:2 ratio) - Landscape images work best
                </>
              ) : (
                <>
                  <strong>Recommended:</strong> 1920×650px (16:5 ratio) - Wide banner format
                </>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-3 mb-6">
            <Label htmlFor="image">
              Desktop Image <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-3">
              {image && (
                <div className="relative aspect-square w-full max-w-sm rounded-lg overflow-hidden bg-muted">
                  <Image src={image} alt="Preview" fill className="object-contain" sizes="400px" />
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading && <p className="text-sm text-muted-foreground">Uploading image...</p>}
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB. Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </div>

          {/* Mobile Image Upload */}
          <div className="space-y-3 mb-6">
            <Label htmlFor="mobileImage">
              Mobile Image <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <div className="space-y-3">
              {mobileImage && (
                <div className="relative aspect-square w-full max-w-sm rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={mobileImage}
                    alt="Mobile Preview"
                    fill
                    className="object-contain"
                    sizes="400px"
                  />
                </div>
              )}
              <Input
                id="mobileImage"
                type="file"
                accept="image/*"
                onChange={handleMobileImageUpload}
                disabled={isUploadingMobile}
              />
              {isUploadingMobile && (
                <p className="text-sm text-muted-foreground">Uploading mobile image...</p>
              )}
              <p className="text-xs text-muted-foreground">
                {slideType === "IMAGE_ONLY"
                  ? "Recommended: 1080×1200px (portrait). If not provided, desktop image will be used."
                  : "Recommended: 1080×1350px (portrait). If not provided, desktop image will be used."}
              </p>
            </div>
          </div>

          {/* Image Alt Text */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="imageAlt">Image Alt Text (for SEO)</Label>
            <Input
              id="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>

          {/* Content Fields - Only for IMAGE_WITH_CONTENT */}
          {slideType === "IMAGE_WITH_CONTENT" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Power Your Projects"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="with Raspberry Pi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Experience next-level performance..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="/products"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Settings</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (Show on homepage)
              </Label>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/hero-slides")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? "Saving..." : slide ? "Update Slide" : "Create Slide"}
          </Button>
        </div>
      </form>
    </div>
  );
}
