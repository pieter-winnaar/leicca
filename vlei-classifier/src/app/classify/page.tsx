/**
 * LEICCA vLEI Classifier - Classify Page
 *
 * Navigate LEICCA Basel CCR decision trees to classify legal entities for counterparty credit risk compliance
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Breadcrumb,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Label,
  Separator,
  Alert,
  AlertTitle,
  AlertDescription,
  Timeline,
  Stepper,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  FileUpload,
} from '@design-system-demo/design-system';
import type { BreadcrumbItem } from '@design-system-demo/design-system';
import {
  GitBranch,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Anchor,
  CheckCircle2,
  AlertCircle,
  Info,
  Upload,
  PlayCircle,
} from 'lucide-react';
import { classifyCounterpartyAction } from './actions';
import { getVerificationResult, storeClassificationResult, storeScreenshot } from '@/lib/workflow-storage';
import type {
  LEICCADecisionTreeNode,
  DecisionPathStep,
  ClassificationResult,
} from '@/types/decision-tree';

type ClassifyState = 'selection' | 'in-progress' | 'complete';

interface PanelOption {
  id: string;
  name: string;
  country: string;
  description: string;
}

export default function ClassifyPage() {
  const router = useRouter();
  const [state, setState] = useState<ClassifyState>('selection');

  // Selection state
  const [panels, setPanels] = useState<PanelOption[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState('');
  const [autoMatched, setAutoMatched] = useState(false);

  // Question flow state
  const [currentNode, setCurrentNode] = useState<LEICCADecisionTreeNode | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [decisionPath, setDecisionPath] = useState<DecisionPathStep[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [screenshot, setScreenshot] = useState<{
    file: File;
    hash: string;
    dataUrl: string;
  } | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Result state
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Classify', href: '/classify' },
  ];

  // Load panels and try to auto-match jurisdiction on mount
  useEffect(() => {
    async function loadPanels() {
      const formData = new FormData();
      formData.append('action', 'loadPanels');
      const response = await classifyCounterpartyAction(formData);

      if (response.panels) {
        setPanels(response.panels);

        // Try to auto-match jurisdiction from verification
        const verification = getVerificationResult();
        if (verification?.jurisdiction) {
          const matchFormData = new FormData();
          matchFormData.append('action', 'matchJurisdiction');
          matchFormData.append('jurisdiction', verification.jurisdiction);

          const matchResponse = await classifyCounterpartyAction(matchFormData);
          if (matchResponse.panel) {
            setSelectedPanelId(matchResponse.panel.id);
            setAutoMatched(true);
          }
        }
      }
    }

    loadPanels();
  }, []);

  async function handleScreenshotUpload(file: File) {
    try {
      // Hash the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Create data URL for preview/download
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const screenshotData = {
        file,
        hash: hashHex,
        dataUrl,
      };

      setScreenshot(screenshotData);

      // Store in session storage
      storeScreenshot({
        filename: file.name,
        hash: hashHex,
        dataUrl,
      });
    } catch (error) {
      console.error('Failed to hash screenshot:', error);
    }
  }

  async function handleStartClassification() {
    if (!selectedPanelId) return;

    setLoading(true);
    setState('in-progress');

    // Start classification - load start node
    const formData = new FormData();
    formData.append('action', 'start');
    formData.append('panelId', selectedPanelId);

    const response = await classifyCounterpartyAction(formData);

    if (response.node) {
      setCurrentNode(response.node);
      setTotalQuestions(response.totalQuestions || 0);
      setDecisionPath([]);
    } else if (response.error) {
      console.error('Start classification error:', response.error);
    }

    setLoading(false);
  }

  async function handleNext() {
    if (!currentNode || !selectedPanelId) return;

    // Validate input based on node type
    if (currentNode.nodeType === 'question' && !selectedAnswer) return;
    if (currentNode.nodeType === 'select' && !selectedAnswer) return;
    if (currentNode.nodeType === 'screenshot' && !uploadedFile) return;

    setLoading(true);

    // Determine answer based on node type
    let answer = '';
    if (currentNode.nodeType === 'question') {
      answer = selectedAnswer; // 'yes' or 'no'
    } else if (currentNode.nodeType === 'select') {
      answer = selectedAnswer; // option ID
    } else if (currentNode.nodeType === 'start' || currentNode.nodeType === 'screenshot') {
      answer = 'continue';
    }

    // Add to decision path (only for question/select nodes)
    const newDecisionPath = [...decisionPath];
    if (currentNode.nodeType === 'question' || currentNode.nodeType === 'select') {
      newDecisionPath.push({
        nodeId: currentNode.id,
        nodeText: currentNode.nodeText,
        answer:
          currentNode.nodeType === 'select'
            ? currentNode.selectOptions?.find((opt) => opt.id === selectedAnswer)?.text || answer
            : answer === 'yes'
            ? 'Yes'
            : 'No',
      });
      setDecisionPath(newDecisionPath);
    }

    // Navigate to next node
    const formData = new FormData();
    formData.append('action', 'next');
    formData.append('panelId', selectedPanelId);
    formData.append('nodeId', currentNode.id);
    formData.append('answer', answer);

    const response = await classifyCounterpartyAction(formData);

    if (response.node) {
      const nextNode = response.node;
      setCurrentNode(nextNode);
      setSelectedAnswer('');
      setUploadedFile(null);

      // Check if end node
      if (nextNode.nodeType === 'end') {
        // Complete classification
        const completeFormData = new FormData();
        completeFormData.append('action', 'complete');
        completeFormData.append('panelId', selectedPanelId);
        completeFormData.append('endNodeId', nextNode.id);
        completeFormData.append('decisionPath', JSON.stringify(newDecisionPath));

        // Include screenshot data if available
        if (screenshot) {
          completeFormData.append('screenshotHash', screenshot.hash);
          completeFormData.append('screenshotFilename', screenshot.file.name);
        }

        const completeResponse = await classifyCounterpartyAction(completeFormData);

        if (completeResponse.classification) {
          setResult(completeResponse.classification);
          setState('complete');
          storeClassificationResult(completeResponse.classification);
        }
      }
    } else if (response.error) {
      console.error('Navigation error:', response.error);
    }

    setLoading(false);
  }

  function handleBack() {
    if (decisionPath.length === 0) {
      // Go back to selection
      setState('selection');
      setCurrentNode(null);
      setDecisionPath([]);
      setSelectedAnswer('');
      setUploadedFile(null);
      return;
    }

    // For now, just show alert - full back navigation would require storing node history
    alert('Back navigation not fully implemented. Use "Start New Classification" to restart.');
  }

  function handleReset() {
    setState('selection');
    setSelectedPanelId('');
    setAutoMatched(false);
    setCurrentNode(null);
    setSelectedAnswer('');
    setUploadedFile(null);
    setDecisionPath([]);
    setResult(null);
  }

  function handleAnchor() {
    router.push('/anchor');
  }

  function handleDownloadReport() {
    // Mock download - Sprint 3 will implement real PDF generation
    const report = {
      panel: panels.find((p) => p.id === selectedPanelId)?.name,
      classification: result,
      path: decisionPath,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classification-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Calculate progress based on question nodes only
  const currentQuestionIndex = decisionPath.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

  // Render node based on type
  function renderNodeContent() {
    if (!currentNode) return null;

    switch (currentNode.nodeType) {
      case 'start':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <PlayCircle className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-center text-2xl">Ready to Begin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Classification Process</AlertTitle>
                <AlertDescription>{currentNode.nodeText}</AlertDescription>
              </Alert>

              <Button onClick={handleNext} disabled={loading} className="w-full" size="lg">
                Continue →
              </Button>
            </CardContent>
          </Card>
        );

      case 'select':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {currentNode.id}
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg leading-relaxed flex-1">
                  {currentNode.nodeText}
                </CardTitle>
                {currentNode.hoverLabel && currentNode.hoverText && (
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <Info className="h-4 w-4 text-primary animate-pulse" />
                        <span className="sr-only">Additional Guidance</span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-96 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{currentNode.hoverLabel}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {currentNode.hoverText}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Select Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="select-option">Select an option</Label>
                <Select value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <SelectTrigger id="select-option">
                    <SelectValue placeholder="Choose from dropdown..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentNode.selectOptions?.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!selectedAnswer || loading} className="flex-1">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'question':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {currentNode.id}
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg leading-relaxed flex-1">
                  {currentNode.nodeText}
                </CardTitle>
                {currentNode.hoverLabel && currentNode.hoverText && (
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <Info className="h-4 w-4 text-primary animate-pulse" />
                        <span className="sr-only">Additional Guidance</span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-96 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{currentNode.hoverLabel}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {currentNode.hoverText}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Yes/No Radio Group */}
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="flex-1 cursor-pointer text-base">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="flex-1 cursor-pointer text-base">
                      No
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {/* Navigation */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!selectedAnswer || loading} className="flex-1">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'screenshot':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {currentNode.id}
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg leading-relaxed flex-1">
                  {currentNode.nodeText}
                </CardTitle>
                {currentNode.hoverLabel && currentNode.hoverText && (
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <Info className="h-4 w-4 text-primary animate-pulse" />
                        <span className="sr-only">Additional Guidance</span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-96 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{currentNode.hoverLabel}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {currentNode.hoverText}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <FileUpload
                accept="image/*,.pdf"
                maxSize={10 * 1024 * 1024} // 10MB
                onFilesChange={(files) => {
                  const file = files[0] || null;
                  setUploadedFile(file);
                  if (file) {
                    handleScreenshotUpload(file);
                  }
                }}
                multiple={false}
              />

              {uploadedFile && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>File Uploaded</AlertTitle>
                  <AlertDescription>
                    {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    {screenshot && (
                      <div className="mt-2 font-mono text-xs text-muted-foreground">
                        SHA-256: {screenshot.hash.slice(0, 16)}...{screenshot.hash.slice(-16)}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!uploadedFile || loading} className="flex-1">
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'end':
        // End node is handled in result phase, but shouldn't reach here
        return null;

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 fade-in">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-responsive-xl font-bold text-foreground mt-4">
            Basel CCR Classification
          </h1>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            Navigate LEICCA decision trees to classify legal entities for counterparty credit risk
            compliance
          </p>
        </div>

        {/* Selection Phase */}
        {state === 'selection' && (
          <Card className="max-w-2xl mx-auto fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" aria-hidden="true" />
                Select Classification Panel
              </CardTitle>
              <CardDescription>
                Choose the jurisdiction and entity type classification panel to begin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {autoMatched && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>Auto-Matched</AlertTitle>
                  <AlertDescription>
                    We've automatically selected the panel based on your verified credential's
                    jurisdiction. You can change it if needed.
                  </AlertDescription>
                </Alert>
              )}

              {/* Panel Selection */}
              <div className="space-y-2">
                <Label htmlFor="panel">Classification Panel</Label>
                <Select value={selectedPanelId} onValueChange={setSelectedPanelId}>
                  <SelectTrigger id="panel">
                    <SelectValue placeholder="Select a classification panel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {panels.map((panel) => (
                      <SelectItem key={panel.id} value={panel.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{panel.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {panel.country} - {panel.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the panel that matches the entity's jurisdiction and type
                </p>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartClassification}
                disabled={!selectedPanelId || loading}
                className="w-full"
                size="lg"
              >
                Start Classification →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Question Flow Phase */}
        {state === 'in-progress' && currentNode && currentNode.nodeType !== 'end' && (
          <div className="max-w-5xl mx-auto space-y-6 fade-in">
            {/* Progress Stepper - only show for question nodes */}
            {totalQuestions > 0 && currentNode.nodeType === 'question' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Question {currentQuestionIndex} of {totalQuestions}
                      </span>
                      <span className="font-medium">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Node Content - Main Column */}
              <div className="lg:col-span-2">{renderNodeContent()}</div>

              {/* Decision Path Timeline - Sidebar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Decision Path</CardTitle>
                  <CardDescription>Your classification journey</CardDescription>
                </CardHeader>
                <CardContent>
                  {decisionPath.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-8">
                      No answers yet. Your decision path will appear here.
                    </p>
                  ) : (
                    <Timeline
                      events={decisionPath.map((step, index) => ({
                        id: step.nodeId,
                        type: 'Decision',
                        title: `Step ${index + 1}`,
                        timestamp: new Date(Date.now() - (decisionPath.length - index) * 60000),
                        description: `${step.nodeText.slice(0, 60)}${
                          step.nodeText.length > 60 ? '...' : ''
                        }`,
                        status: 'success' as const,
                        metadata: {
                          answer: step.answer,
                        },
                      }))}
                      variant="compact"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {state === 'complete' && result && currentNode && currentNode.nodeType === 'end' && (
          <div className="max-w-3xl mx-auto space-y-6 fade-in">
            {/* Success/Failure Alert */}
            <Alert
              variant={result.success ? 'default' : 'destructive'}
              className={
                result.success
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-amber-500/50 bg-amber-500/10'
              }
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              <AlertTitle>
                {result.success ? 'Classification Complete' : 'Classification Result'}
              </AlertTitle>
              <AlertDescription>{currentNode.nodeText}</AlertDescription>
            </Alert>

            {/* Classification Result Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Classification Result</CardTitle>
                  <Badge
                    variant={result.success ? 'default' : 'destructive'}
                    className={
                      result.success
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                    }
                  >
                    {result.classification}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Classification Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Panel</p>
                    <p className="font-medium">
                      {panels.find((p) => p.id === selectedPanelId)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{result.category}</p>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>

                {/* Decision Path */}
                {decisionPath.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Decision Path Taken</h3>
                    <div className="space-y-2">
                      {decisionPath.map((step, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="font-semibold text-muted-foreground min-w-[20px]">
                            {index + 1}.
                          </span>
                          <div>
                            <p className="font-mono text-xs text-muted-foreground">{step.nodeId}</p>
                            <p>
                              <span className="text-muted-foreground">
                                {step.nodeText.slice(0, 80)}
                                {step.nodeText.length > 80 ? '...' : ''}
                              </span>
                              {' → '}
                              <span className="font-medium">{step.answer}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleDownloadReport} className="flex-1">
                    <FileDown className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  {result.success && (
                    <Button onClick={handleAnchor} className="flex-1">
                      <Anchor className="h-4 w-4 mr-2" />
                      Anchor to Blockchain →
                    </Button>
                  )}
                </div>

                <Button variant="ghost" onClick={handleReset} className="w-full">
                  Start New Classification
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
