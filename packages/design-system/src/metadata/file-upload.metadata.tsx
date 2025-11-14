"use client"

import React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { FileUpload } from '../components/file-upload';
import { Label } from '../components/label';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';

// Preview wrapper components with state
function MainPreview() {
  const [files, setFiles] = React.useState<File[]>([]);

  return (
    <div className="max-w-2xl space-y-4">
      <FileUpload
        onFilesChange={setFiles}
        accept=".jpg,.jpeg,.png,.pdf"
        maxFiles={5}
        maxSize={5 * 1024 * 1024}
      />
      {files.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

function CredentialUploadPreview() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>vLEI Credential Verification</CardTitle>
        <CardDescription>
          Upload credential files (.json or .cesr)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          accept=".json,.cesr"
          multiple={false}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          onFilesChange={setFiles}
          disabled={isVerifying}
        />
        {files.length > 0 && (
          <Button onClick={handleVerify} disabled={isVerifying} className="w-full">
            {isVerifying ? 'Verifying...' : 'Verify Credential'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function EvidenceUploadPreview() {
  const [files, setFiles] = React.useState<File[]>([]);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Evidence Files</CardTitle>
        <CardDescription>
          Upload supporting documents for blockchain anchoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          accept="*"
          multiple={true}
          maxFiles={10}
          maxSize={10 * 1024 * 1024}
          onFilesChange={setFiles}
        />
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Ready to anchor {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            <Button className="w-full">Anchor to Blockchain</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImageGalleryUploadPreview() {
  const [_files, setFiles] = React.useState<File[]>([]);

  return (
    <div className="max-w-2xl space-y-4">
      <Label>Upload Images</Label>
      <FileUpload
        accept="image/*"
        multiple={true}
        maxFiles={20}
        maxSize={5 * 1024 * 1024}
        onFilesChange={setFiles}
        aria-label="Upload images for gallery"
      />
      {_files.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {_files.length} image{_files.length !== 1 ? 's' : ''} ready for upload
        </p>
      )}
    </div>
  );
}

function DocumentUploadWithValidationPreview() {
  const [_files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string>('');

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);

    // Example: Custom validation
    const hasInvalidFile = newFiles.some(file => file.name.includes('draft'));
    if (hasInvalidFile) {
      setError('Draft files are not allowed');
    } else {
      setError('');
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>
          Upload final documents only (no drafts)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          accept=".pdf,.doc,.docx"
          multiple={true}
          maxFiles={3}
          maxSize={20 * 1024 * 1024}
          onFilesChange={handleFilesChange}
          error={error}
        />
      </CardContent>
    </Card>
  );
}

function ProfilePictureUploadPreview() {
  const [_file, setFile] = React.useState<File[]>([]);

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a profile picture (max 2MB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          accept="image/jpeg,image/png,image/webp"
          multiple={false}
          maxFiles={1}
          maxSize={2 * 1024 * 1024}
          onFilesChange={setFile}
        />
      </CardContent>
    </Card>
  );
}

export const fileUploadMetadata: ComponentMetadata = {
  id: 'file-upload',
  name: 'FileUpload',
  description: 'Drag-and-drop file upload component with validation, previews, and progress tracking',
  category: 'form',
  variants: ['single', 'multiple'],
  preview: <MainPreview />,
  props: [
    {
      name: 'accept',
      type: 'string',
      description: 'Accepted file types (e.g., ".json,.cesr" or "image/*")',
      required: false,
    },
    {
      name: 'multiple',
      type: 'boolean',
      description: 'Allow multiple file selection',
      required: false,
      defaultValue: 'true',
    },
    {
      name: 'maxFiles',
      type: 'number',
      description: 'Maximum number of files allowed',
      required: false,
      defaultValue: '10',
    },
    {
      name: 'maxSize',
      type: 'number',
      description: 'Maximum file size in bytes',
      required: false,
      defaultValue: '10485760 (10MB)',
    },
    {
      name: 'onFilesChange',
      type: '(files: File[]) => void',
      description: 'Callback when files are added or removed',
      required: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable file upload',
      required: false,
      defaultValue: 'false',
    },
    {
      name: 'error',
      type: 'string',
      description: 'Error message to display',
      required: false,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessibility label',
      required: false,
      defaultValue: '"File upload"',
    },
    {
      name: 'aria-describedby',
      type: 'string',
      description: 'ID of element describing the upload area',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Credential Verification Upload',
      description: 'Single file upload for vLEI credential verification',
      code: `'use client'

import { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';

export function CredentialUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    // Verify credential logic here
    setIsVerifying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>vLEI Credential Verification</CardTitle>
        <CardDescription>
          Upload credential files (.json or .cesr)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          accept=".json,.cesr"
          multiple={false}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          onFilesChange={setFiles}
          disabled={isVerifying}
        />
        {files.length > 0 && (
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify Credential'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <CredentialUploadPreview />,
    },
    {
      title: 'Evidence Files for Blockchain Anchoring',
      description: 'Multiple file upload for evidence documents (max 10 files)',
      code: `'use client'

import { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';

export function EvidenceUpload() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence Files</CardTitle>
        <CardDescription>
          Upload supporting documents for blockchain anchoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          accept="*"
          multiple={true}
          maxFiles={10}
          maxSize={10 * 1024 * 1024}
          onFilesChange={setFiles}
        />
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Ready to anchor {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            <Button className="w-full">Anchor to Blockchain</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <EvidenceUploadPreview />,
    },
    {
      title: 'Image Gallery Upload',
      description: 'Multiple image upload with previews',
      code: `'use client'

import { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Label } from '@/components/label';

export function ImageGalleryUpload() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="space-y-4">
      <Label>Upload Images</Label>
      <FileUpload
        accept="image/*"
        multiple={true}
        maxFiles={20}
        maxSize={5 * 1024 * 1024}
        onFilesChange={setFiles}
        aria-label="Upload images for gallery"
      />
      {files.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {files.length} image{files.length !== 1 ? 's' : ''} ready for upload
        </p>
      )}
    </div>
  );
}`,
      language: 'tsx',
      preview: <ImageGalleryUploadPreview />,
    },
    {
      title: 'Document Upload with Custom Validation',
      description: 'Upload documents with custom validation logic',
      code: `'use client'

import { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';

export function DocumentUploadWithValidation() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);

    // Custom validation: reject draft files
    const hasInvalidFile = newFiles.some(file =>
      file.name.toLowerCase().includes('draft')
    );

    if (hasInvalidFile) {
      setError('Draft files are not allowed');
    } else {
      setError('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>
          Upload final documents only (no drafts)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          accept=".pdf,.doc,.docx"
          multiple={true}
          maxFiles={3}
          maxSize={20 * 1024 * 1024}
          onFilesChange={handleFilesChange}
          error={error}
        />
      </CardContent>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <DocumentUploadWithValidationPreview />,
    },
    {
      title: 'Profile Picture Upload',
      description: 'Single image upload for profile pictures',
      code: `'use client'

import { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';

export function ProfilePictureUpload() {
  const [file, setFile] = useState<File[]>([]);

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a profile picture (max 2MB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          accept="image/jpeg,image/png,image/webp"
          multiple={false}
          maxFiles={1}
          maxSize={2 * 1024 * 1024}
          onFilesChange={setFile}
        />
      </CardContent>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <ProfilePictureUploadPreview />,
    },
  ],
  dependencies: ['react', 'lucide-react'],
  tags: ['file', 'upload', 'drag-and-drop', 'form', 'input', 'validation', 'preview', 'vlei', 'credential', 'evidence'],
};
