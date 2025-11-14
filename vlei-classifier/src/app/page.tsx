/**
 * LEICCA vLEI Classifier - Landing Page
 *
 * Landing page with navigation to verification, classification, anchoring, and audit features
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Separator,
  Avatar,
  AvatarFallback
} from '@design-system-demo/design-system';
import { ShieldCheck, GitBranch, Anchor, Clock, CheckCircle, Building2, Shield, TrendingUp, Zap, Quote } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section - Compact */}
        <div className="text-center py-12 sm:py-16 max-w-4xl mx-auto fade-in">
          {/* Main Headline - Value Proposition */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-4">
            Automate Basel CCR Compliance
          </h1>

          {/* Trust Badge BELOW Headline */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>GLEIF vLEI · BSV Blockchain</span>
          </div>

          {/* Sub-headline - How */}
          <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            With vLEI credentials and Blockchain audit trails
          </p>

          {/* Dual CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button asChild className="h-11 text-base min-w-[180px]">
              <Link href="/verify">
                Start Verification →
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 text-base min-w-[180px]">
              <a href="#how-it-works">
                See How It Works ↓
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Section - With Separators */}
        <Separator className="my-16" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center fade-in delay-100">
            <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              142
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              vLEI Credentials Verified
            </div>
            <div className="text-xs text-muted-foreground">
              Average verification time: &lt;3 seconds
            </div>
          </div>

          <div className="text-center fade-in delay-200">
            <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              16
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              Jurisdiction Layouts
            </div>
            <div className="text-xs text-muted-foreground">
              Covering major financial centers
            </div>
          </div>

          <div className="text-center fade-in delay-300">
            <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              89
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              Blockchain-Anchored Records
            </div>
            <div className="text-xs text-muted-foreground">
              100% tamper-proof audit coverage
            </div>
          </div>
        </div>

        <Separator className="my-24" />

        {/* Use Case Showcase - Accordion */}
        <section className="py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built for Regulated Industries
            </h2>
            <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
              Real-world scenarios demonstrating how LEICCA streamlines compliance
              workflows across banking, insurance, and investment sectors
            </p>
          </div>

          <Accordion type="single" collapsible className="max-w-4xl mx-auto space-y-4">
            {/* Use Case 1: Cayman Islands Bank */}
            <AccordionItem value="bank" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-semibold">Cayman Islands Bank</div>
                    <div className="text-sm text-muted-foreground">
                      Verify counterparty credentials and classify for capital requirements under Basel III
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Challenge</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manual review of vLEI credentials takes 2 hours per counterparty
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Solution</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automated verification + classification in under 5 minutes
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Impact</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      95% time reduction, 100% audit trail coverage
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Use Case 2: Insurance Company */}
            <AccordionItem value="insurance" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-semibold">Insurance Company</div>
                    <div className="text-sm text-muted-foreground">
                      Automated KYC verification for corporate policyholders with audit-ready documentation
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Challenge</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manual KYC processes lack verifiable audit trails
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Solution</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Blockchain-anchored verification with cryptographic evidence
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Impact</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Zero manual documentation, instant regulatory reporting
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Use Case 3: Investment Fund */}
            <AccordionItem value="investment" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-semibold">Investment Fund</div>
                    <div className="text-sm text-muted-foreground">
                      Classify fund investors across 16 jurisdictions with regulatory citations
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Challenge</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Multi-jurisdiction compliance requires expert regulatory knowledge
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Solution</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Guided decision trees with jurisdiction-specific regulatory citations
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <strong className="text-foreground">Impact</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Instant compliance reporting, no regulatory expertise required
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Testimonials Section */}
        <section className="py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Trusted by Compliance Professionals
            </h2>
            <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
              See how LEICCA is transforming regulatory compliance workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-500/10 text-blue-600 font-semibold">SC</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">Chief Compliance Officer</div>
                    <div className="text-xs text-muted-foreground">Cayman International Bank</div>
                  </div>
                  <Quote className="h-8 w-8 text-primary/20" />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  &quot;LEICCA reduced our counterparty verification time from 2 hours to under 5 minutes.
                  The blockchain audit trail gives us complete confidence during regulatory reviews.&quot;
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-green-500/10 text-green-600 font-semibold">MW</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Marcus Weber</div>
                    <div className="text-sm text-muted-foreground">Head of Risk Management</div>
                    <div className="text-xs text-muted-foreground">Global Re Insurance</div>
                  </div>
                  <Quote className="h-8 w-8 text-primary/20" />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  &quot;The cryptographic verification and automated KYC workflows eliminated manual errors.
                  We now have 100% audit coverage with zero additional overhead.&quot;
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-500/10 text-purple-600 font-semibold">PS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Dr. Priya Sharma</div>
                    <div className="text-sm text-muted-foreground">Regulatory Affairs Director</div>
                    <div className="text-xs text-muted-foreground">Apex Investment Fund</div>
                  </div>
                  <Quote className="h-8 w-8 text-primary/20" />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  &quot;Multi-jurisdiction compliance used to require expert knowledge of 16 different regulatory frameworks.
                  LEICCA&apos;s guided decision trees make it accessible to our entire team.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works - Enhanced Timeline */}
        <section id="how-it-works" className="py-24 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
              Four simple steps from credential upload to regulatory compliance
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connecting Line - Gradient */}
              <div className="absolute top-10 left-10 w-0.5 h-[calc(100%-80px)] bg-gradient-to-b from-primary via-primary/50 to-primary/20 z-0" />

              {/* Step 1 */}
              <div className="relative flex items-start gap-6 mb-12">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center font-bold z-10">
                  <ShieldCheck className="h-8 w-8 mb-1" />
                  <span className="text-sm">1</span>
                </div>
                <div className="flex-1 pt-2 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold text-foreground">
                        Upload vLEI Credential
                      </h3>
                      <Badge variant="secondary">~30 seconds</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Drag and drop or paste your vLEI credential in JSON or CESR format
                    </p>
                  </div>
                  {/* Screenshot */}
                  <Card className="overflow-hidden border-2 shadow-lg">
                    <Image
                      src="/screenshots/step-1-upload.png"
                      alt="vLEI credential upload interface"
                      width={1200}
                      height={700}
                      className="w-full h-auto"
                      priority
                    />
                    <CardContent className="p-4 bg-muted/30 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Verify Page</p>
                          <p className="text-xs text-muted-foreground">Credential upload interface</p>
                        </div>
                        <Button asChild variant="link" size="sm">
                          <Link href="/verify">View Live →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-6 mb-12">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center font-bold z-10">
                  <CheckCircle className="h-8 w-8 mb-1" />
                  <span className="text-sm">2</span>
                </div>
                <div className="flex-1 pt-2 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold text-foreground">
                        Instant Cryptographic Verification
                      </h3>
                      <Badge variant="secondary">~3 seconds</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      SAID validation, signature verification, and GLEIF registry checks
                    </p>
                  </div>
                  {/* Screenshot */}
                  <Card className="overflow-hidden border-2 shadow-lg">
                    <Image
                      src="/screenshots/step-2-verify.png"
                      alt="Credential verification result showing GLEIF Americas verified"
                      width={1200}
                      height={700}
                      className="w-full h-auto"
                    />
                    <CardContent className="p-4 bg-muted/30 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Verify Result</p>
                          <p className="text-xs text-muted-foreground">Cryptographic validation complete</p>
                        </div>
                        <Button asChild variant="link" size="sm">
                          <Link href="/verify">View Live →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-6 mb-12">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center font-bold z-10">
                  <Anchor className="h-8 w-8 mb-1" />
                  <span className="text-sm">3</span>
                </div>
                <div className="flex-1 pt-2 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold text-foreground">
                        Automated Basel CCR Classification
                      </h3>
                      <Badge variant="secondary">~3-5 minutes</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Navigate guided decision tree with jurisdiction-specific questions and regulatory citations
                    </p>
                  </div>
                  {/* Screenshot */}
                  <Card className="overflow-hidden border-2 shadow-lg">
                    <Image
                      src="/screenshots/step-3-classify.png"
                      alt="Classification result showing 20% risk weight for Foreign Bank Branch"
                      width={1200}
                      height={700}
                      className="w-full h-auto"
                    />
                    <CardContent className="p-4 bg-muted/30 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Classification Result</p>
                          <p className="text-xs text-muted-foreground">Basel CCR category with decision path</p>
                        </div>
                        <Button asChild variant="link" size="sm">
                          <Link href="/classify">View Live →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center font-bold z-10">
                  <Anchor className="h-8 w-8 mb-1" />
                  <span className="text-sm">4</span>
                </div>
                <div className="flex-1 pt-2 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold text-foreground">
                        Blockchain Audit Trail
                      </h3>
                      <Badge variant="secondary">~10-30 seconds</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      DocV1 encryption and BSV blockchain anchoring creates immutable, auditable compliance record
                    </p>
                  </div>
                  {/* Screenshot */}
                  <Card className="overflow-hidden border-2 shadow-lg">
                    <Image
                      src="/screenshots/step-4-anchor.png"
                      alt="Blockchain anchoring interface with DocV1 encryption and evidence files"
                      width={1200}
                      height={700}
                      className="w-full h-auto"
                    />
                    <CardContent className="p-4 bg-muted/30 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Anchor Page</p>
                          <p className="text-xs text-muted-foreground">DocV1 encryption & blockchain broadcast</p>
                        </div>
                        <Button asChild variant="link" size="sm">
                          <Link href="/anchor">View Live →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Total Time - Enhanced */}
            <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg shadow-lg">
              <div className="text-sm text-muted-foreground mb-2">Total Time</div>
              <div className="text-4xl font-bold text-primary mb-2">~5-8 minutes</div>
              <div className="text-sm text-muted-foreground">
                vs. 2+ hours manual process
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer - Enhanced */}
        <section className="py-16 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/30 shadow-xl">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Ready to Automate Your Compliance Workflow?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Start verifying vLEI credentials and classifying entities in under 5 minutes
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button asChild className="h-14 text-lg min-w-[200px]">
                  <Link href="/verify">
                    Try LEICCA Now →
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-14 text-lg min-w-[200px]">
                  <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    Watch Demo Video
                  </a>
                </Button>
              </div>

              <Separator className="my-8 max-w-md mx-auto" />

              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <a href="https://github.com/d2legaltech/leicca-vlei-classifier" className="hover:text-primary transition-colors flex items-center gap-1">
                  View Source Code
                </a>
                <span className="text-muted-foreground/50">•</span>
                <a href="/audit" className="hover:text-primary transition-colors flex items-center gap-1">
                  Documentation
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center" role="contentinfo">
          <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>LEICCA vLEI Classifier</span>
            <span className="text-muted-foreground/50">•</span>
            <span>GLEIF Hackathon 2025</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Powered by D2 Legal Technology</span>
          </div>
          <div className="text-xs text-muted-foreground/70">
            Built with Next.js 15, React 19, TypeScript, and BSV Blockchain
          </div>
        </footer>
      </div>
    </div>
  );
}
