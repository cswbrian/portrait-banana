"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomizationOptions as CustomizationOptionsType } from "@/types";
import { CUSTOMIZATION_OPTIONS } from "@/lib/constants";
import { Building2, Camera, Check } from "lucide-react";
import { useState } from "react";

interface CustomizationOptionsProps {
  options: CustomizationOptionsType;
  onChange: (options: CustomizationOptionsType) => void;
  disabled?: boolean;
}

export function CustomizationOptions({
  options,
  onChange,
  disabled = false,
}: CustomizationOptionsProps) {
  const [selectedBackground, setSelectedBackground] = useState<CustomizationOptionsType['background']>(options.background);
  const [selectedStyle, setSelectedStyle] = useState<CustomizationOptionsType['style']>(options.style);

  const handleBackgroundChange = (background: CustomizationOptionsType['background']) => {
    if (disabled) return;
    setSelectedBackground(background);
    onChange({ ...options, background });
  };

  const handleStyleChange = (style: CustomizationOptionsType['style']) => {
    if (disabled) return;
    setSelectedStyle(style);
    onChange({ ...options, style });
  };

  return (
    <div className="space-y-8">
      {/* Background Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Choose Background
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CUSTOMIZATION_OPTIONS.BACKGROUNDS.map((bg) => (
            <Card
              key={bg.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedBackground === bg.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleBackgroundChange(bg.id as CustomizationOptionsType['background'])}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{bg.name}</CardTitle>
                  {selectedBackground === bg.id && (
                    <Badge variant="default" className="bg-blue-600">
                      <Check className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {bg.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`aspect-video rounded-lg ${
                  bg.id === 'office' 
                    ? 'bg-gradient-to-br from-blue-100 to-blue-200' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                } flex items-center justify-center`}>
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 ${
                      bg.id === 'office' ? 'bg-blue-300' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs text-gray-600 font-medium">
                      {bg.name} Background
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Choose Style
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CUSTOMIZATION_OPTIONS.STYLES.map((style) => (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedStyle === style.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleStyleChange(style.id as CustomizationOptionsType['style'])}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{style.name}</CardTitle>
                  {selectedStyle === style.id && (
                    <Badge variant="default" className="bg-blue-600">
                      <Check className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {style.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-2 ${
                      style.id === 'formal' ? 'bg-gray-800' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-600 font-medium">
                      {style.name} Attire
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Your Selection:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white">
              Background: {CUSTOMIZATION_OPTIONS.BACKGROUNDS.find(bg => bg.id === selectedBackground)?.name}
            </Badge>
            <Badge variant="outline" className="bg-white">
              Style: {CUSTOMIZATION_OPTIONS.STYLES.find(style => style.id === selectedStyle)?.name}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
