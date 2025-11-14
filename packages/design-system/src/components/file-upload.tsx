"use client"

import * as React from "react"
import { Upload, X, File, FileImage, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./button"
import { Progress } from "./progress"

export interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  onFilesChange?: (files: File[]) => void
  disabled?: boolean
  error?: string
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

interface FileWithPreview {
  file: File
  preview?: string
  error?: string
  progress?: number
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      multiple = true,
      maxFiles = 10,
      maxSize = 10 * 1024 * 1024, // 10MB default
      onFilesChange,
      disabled = false,
      error,
      className,
      "aria-label": ariaLabel = "File upload",
      "aria-describedby": ariaDescribedby,
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<FileWithPreview[]>([])
    const [isDragging, setIsDragging] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Validate file
    const validateFile = (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`
      }

      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim())
        const extension = file.name.split('.').pop()
        const fileExtension = extension ? `.${extension.toLowerCase()}` : ''
        const mimeType = file.type

        const isAccepted = acceptedTypes.some(acceptedType => {
          if (acceptedType.startsWith('.')) {
            return fileExtension === acceptedType.toLowerCase()
          }
          if (acceptedType.endsWith('/*')) {
            const baseType = acceptedType.split('/')[0]
            return baseType && mimeType.startsWith(baseType)
          }
          return mimeType === acceptedType
        })

        if (!isAccepted) {
          return `File type not accepted. Expected: ${accept}`
        }
      }

      return null
    }

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    // Handle file selection
    const handleFiles = (newFiles: FileList | null) => {
      if (!newFiles || disabled) return

      const fileArray = Array.from(newFiles)
      const currentFileCount = files.length

      // Check max files
      if (!multiple && fileArray.length > 1) {
        fileArray.splice(1)
      }

      if (currentFileCount + fileArray.length > maxFiles) {
        // Truncate to max files
        fileArray.splice(maxFiles - currentFileCount)
      }

      // Validate and add files
      const newFilesWithPreview: FileWithPreview[] = fileArray.map(file => {
        const error = validateFile(file)
        const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined

        return {
          file,
          preview,
          error: error || undefined,
          progress: 0,
        }
      })

      const updatedFiles = multiple ? [...files, ...newFilesWithPreview] : newFilesWithPreview
      setFiles(updatedFiles)

      // Notify parent
      if (onFilesChange) {
        const validFiles = updatedFiles.filter(f => !f.error).map(f => f.file)
        onFilesChange(validFiles)
      }
    }

    // Remove file
    const removeFile = (index: number) => {
      const fileToRemove = files[index]

      // Revoke preview URL if exists
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }

      const updatedFiles = files.filter((_, i) => i !== index)
      setFiles(updatedFiles)

      // Notify parent
      if (onFilesChange) {
        const validFiles = updatedFiles.filter(f => !f.error).map(f => f.file)
        onFilesChange(validFiles)
      }
    }

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragging(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const droppedFiles = e.dataTransfer.files
      handleFiles(droppedFiles)
    }

    // Click to browse
    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click()
      }
    }

    // Keyboard support
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    }

    // Cleanup preview URLs on unmount
    React.useEffect(() => {
      return () => {
        files.forEach(file => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview)
          }
        })
      }
    }, [])

    // Get file icon based on type
    const getFileIcon = (file: File) => {
      if (file.type.startsWith('image/')) {
        return <FileImage className="h-5 w-5" />
      }
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        return <FileText className="h-5 w-5" />
      }
      return <File className="h-5 w-5" />
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        {/* Drop Zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
            "hover:border-primary/50 hover:bg-accent/5",
            isDragging && "border-primary bg-accent/10",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
          aria-disabled={disabled}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => handleFiles(e.target.files)}
            aria-hidden="true"
          />

          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div
              className={cn(
                "rounded-full p-4 bg-accent",
                isDragging && "bg-primary/10"
              )}
            >
              <Upload className={cn(
                "h-8 w-8 text-muted-foreground",
                isDragging && "text-primary"
              )} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop files here" : "Drag and drop files here"}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse from your computer
              </p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              {accept && (
                <p>Accepted types: {accept}</p>
              )}
              <p>
                Max {maxFiles} file{maxFiles !== 1 ? 's' : ''}, {formatFileSize(maxSize)} each
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>

            <ul className="space-y-2" role="list">
              {files.map((fileWithPreview, index) => (
                <li
                  key={`${fileWithPreview.file.name}-${index}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border bg-card",
                    fileWithPreview.error && "border-destructive bg-destructive/5"
                  )}
                >
                  {/* Preview or Icon */}
                  {fileWithPreview.preview ? (
                    <img
                      src={fileWithPreview.preview}
                      alt={fileWithPreview.file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-accent">
                      {getFileIcon(fileWithPreview.file)}
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {fileWithPreview.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileWithPreview.file.size)}
                    </p>

                    {/* Progress Bar */}
                    {fileWithPreview.progress !== undefined && fileWithPreview.progress > 0 && fileWithPreview.progress < 100 && (
                      <Progress value={fileWithPreview.progress} className="h-1" />
                    )}

                    {/* Error Message */}
                    {fileWithPreview.error && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fileWithPreview.error}
                      </p>
                    )}
                  </div>

                  {/* Status Icon */}
                  {!fileWithPreview.error && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    aria-label={`Remove ${fileWithPreview.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"
