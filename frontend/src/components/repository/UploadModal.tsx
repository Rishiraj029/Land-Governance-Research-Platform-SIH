import { useState } from "react";
import { X, Upload, FileText, Check, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import type { ContentType, Theme, AccessTier } from "../../types/repository";
import { CONTENT_TYPES, THEMES, STATES, LANGUAGES, ACCESS_TIERS } from "../../lib/mockRepositoryData";
import { uploadRepositoryDocument } from "../../lib/supabaseRepository";
import { useAuth } from "../../hooks/useAuth";

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess?: () => void;
}

type UploadStep = 1 | 2 | 3 | 4;

// Client-side guard rails for contributed files (the storage service still
// enforces its own limits server-side).
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "docx", "csv", "shp", "tif", "tiff"];

function validateFile(candidate: File): string | null {
  const extension = candidate.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return `Unsupported file type ".${extension}". Allowed formats: PDF, DOCX, CSV, Shapefile, GeoTIFF.`;
  }
  if (candidate.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${(candidate.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 50 MB.`;
  }
  return null;
}

export default function UploadModal({ onClose, onUploadSuccess }: UploadModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<UploadStep>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Form state
  const [contentType, setContentType] = useState<ContentType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Theme | "">("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [language, setLanguage] = useState("English");
  const [accessTier, setAccessTier] = useState<AccessTier>("Public");

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validationError = validateFile(droppedFile);
      setUploadError(validationError);
      setFile(validationError ? null : droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validationError = validateFile(selectedFile);
      setUploadError(validationError);
      setFile(validationError ? null : selectedFile);
    }
  };

  const canProceedToStep2 = contentType !== "";
  const canProceedToStep3 = file !== null && title.trim() !== "" && description.trim() !== "";
  const canProceedToStep4 = selectedTheme !== "" && state !== "";

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as UploadStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as UploadStep);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setUploadError("You must be logged in to upload documents");
      return;
    }

    if (!file) {
      setUploadError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const result = await uploadRepositoryDocument(
      file,
      {
        contentType: contentType as ContentType,
        title,
        description,
        theme: selectedTheme as Theme,
        state,
        district: district || undefined,
        accessTier,
        language,
        author: user.user_metadata?.full_name || user.email?.split('@')[0] || "Unknown",
        institution: user.user_metadata?.institution || "Unknown",
        summary: description.substring(0, 200),
      },
      user.id
    );

    setIsUploading(false);

    if (result.error) {
      setUploadError(result.error);
    } else {
      setCurrentStep(4);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
  };

  const resetForm = () => {
    setContentType("");
    setFile(null);
    setTitle("");
    setDescription("");
    setSelectedTheme("");
    setState("");
    setDistrict("");
    setLanguage("English");
    setAccessTier("Public");
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E1E5EA]">
          <h2 className="text-xl font-semibold text-[#1F2933]">Contribute to Repository</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F7FA] rounded-md text-[#5A6472]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-[#E1E5EA]">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-[#0B3D91] text-white"
                      : "bg-[#E1E5EA] text-[#5A6472]"
                  }`}
                >
                  {currentStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      currentStep > step ? "bg-[#0B3D91]" : "bg-[#E1E5EA]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#5A6472]">
            <span className="w-20 text-center">Content Type</span>
            <span className="w-20 text-center">Upload</span>
            <span className="w-20 text-center">Metadata</span>
            <span className="w-20 text-center">Review</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1F2933] mb-4">
                Select Content Type
              </h3>
              <p className="text-sm text-[#5A6472] mb-6">
                Choose the type of content you're contributing to the repository.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CONTENT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setContentType(type)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      contentType === type
                        ? "border-[#0B3D91] bg-[#0B3D91]/5"
                        : "border-[#E1E5EA] hover:border-[#0B3D91]/50"
                    }`}
                  >
                    <FileText className="h-5 w-5 text-[#0B3D91] mb-2" />
                    <span className="text-sm font-medium text-[#1F2933]">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1F2933] mb-4">
                Upload File
              </h3>
              <p className="text-sm text-[#5A6472] mb-6">
                Upload your document or dataset. Supported formats: PDF, DOCX, CSV, Shapefile, GeoTIFF.
              </p>
              
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging
                    ? "border-[#0B3D91] bg-[#0B3D91]/5"
                    : "border-[#E1E5EA] hover:border-[#0B3D91]/50"
                }`}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 text-[#0B3D91] mx-auto" />
                    <p className="text-sm font-medium text-[#1F2933]">{file.name}</p>
                    <p className="text-xs text-[#5A6472]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-sm text-[#D64545] hover:text-[#B03636]"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-[#5A6472] mx-auto" />
                    <p className="text-sm text-[#1F2933]">
                      Drag and drop your file here, or
                    </p>
                    <label className="inline-block">
                      <span className="text-sm text-[#0B3D91] hover:text-[#FF9933] cursor-pointer">
                        browse to choose a file
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.docx,.csv,.shp,.tif,.tiff"
                      />
                    </label>
                  </div>
                )}
              </div>

              {file && (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2933] mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                      placeholder="Enter document title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1F2933] mb-1">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                      placeholder="Brief description of the content"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#1F2933] mb-4">
                Metadata
              </h3>
              <p className="text-sm text-[#5A6472] mb-6">
                Add metadata to help others discover your content.
              </p>

              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">
                  Theme *
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map(theme => (
                    <button
                      key={theme}
                      onClick={() => setSelectedTheme(theme)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                        selectedTheme === theme
                          ? "border-[#0B3D91] bg-[#0B3D91]/10 text-[#0B3D91]"
                          : "border-[#E1E5EA] text-[#5A6472] hover:border-[#0B3D91]/50"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">
                  Geography *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                  >
                    <option value="">Select State</option>
                    {STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                    placeholder="District (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">
                  Language *
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">
                  Access Tier *
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACCESS_TIERS.map(tier => (
                    <button
                      key={tier}
                      onClick={() => setAccessTier(tier)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                        accessTier === tier
                          ? "border-[#0B3D91] bg-[#0B3D91]/10 text-[#0B3D91]"
                          : "border-[#E1E5EA] text-[#5A6472] hover:border-[#0B3D91]/50"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#5A6472] mt-2">
                  {accessTier === "Government-Only" && "Only government officials with appropriate clearance can access this content."}
                  {accessTier === "Restricted" && "Only verified researchers and institutions can access this content."}
                  {accessTier === "Public" && "Anyone can access this content."}
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#138808]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-[#138808]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2933] mb-2">
                  Document Published
                </h3>
                <p className="text-[#5A6472] max-w-md mx-auto">
                  Your document is now live in the Knowledge Repository and can be found through search and filters. You can open it any time from the Repository page.
                </p>
              </div>

              <div className="bg-[#F5F7FA] rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-[#1F2933]">Submission Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#5A6472]">Content Type:</span>
                    <span className="ml-2 text-[#1F2933]">{contentType}</span>
                  </div>
                  <div>
                    <span className="text-[#5A6472]">File:</span>
                    <span className="ml-2 text-[#1F2933]">{file?.name}</span>
                  </div>
                  <div>
                    <span className="text-[#5A6472]">Theme:</span>
                    <span className="ml-2 text-[#1F2933]">{selectedTheme}</span>
                  </div>
                  <div>
                    <span className="text-[#5A6472]">Geography:</span>
                    <span className="ml-2 text-[#1F2933]">{state}</span>
                  </div>
                  <div>
                    <span className="text-[#5A6472]">Language:</span>
                    <span className="ml-2 text-[#1F2933]">{language}</span>
                  </div>
                  <div>
                    <span className="text-[#5A6472]">Access Tier:</span>
                    <span className="ml-2 text-[#1F2933]">{accessTier}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#E8A33D] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-[#1F2933]">What happens next?</p>
                  <p className="text-[#5A6472] mt-1">
                    Your document is published to the Knowledge Repository as soon as you submit it, and becomes searchable alongside the existing documents.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between p-6 border-t border-[#E1E5EA]">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isUploading}
              className="px-4 py-2 rounded-md text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={
                isUploading ||
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3) ||
                (currentStep === 3 && !canProceedToStep4)
              }
              className="px-4 py-2 rounded-md bg-[#0B3D91] text-white text-sm font-medium hover:bg-[#062A63] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  {currentStep === 3 ? "Submit" : "Next"}
                  {currentStep < 3 && <ArrowRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="mx-6 mb-6 p-4 bg-[#D64545]/10 border border-[#D64545]/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#D64545] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-[#1F2933]">Upload Error</p>
              <p className="text-[#5A6472] mt-1">{uploadError}</p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex justify-center p-6 border-t border-[#E1E5EA]">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-6 py-2 rounded-md bg-[#0B3D91] text-white text-sm font-medium hover:bg-[#062A63]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
