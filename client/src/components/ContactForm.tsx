import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { contactFormLabels, contactFormTranslations, contactPageFallbacks } from '@/lib/contactFormTranslations';

export function ContactForm() {
  const { language, t } = useLanguage();
  const formCopy = contactFormTranslations[language];
  const labels = contactFormLabels[language];
  const pageCopy = { ...t, ...contactPageFallbacks[language] };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const submitContactMutation = trpc.contact.submit.useMutation({
    onSuccess: (result) => {
      toast.success(result.delivery === 'email'
        ? formCopy.sentSuccessfully
        : formCopy.savedPending);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (error) => {
      const validationMessages = (
        error.data as { zodError?: { fieldErrors?: Record<string, string[]> } } | undefined
      )?.zodError?.fieldErrors;
      if (validationMessages) {
        toast.error(formCopy.validationError);
        return;
      }

      console.error('Contact form submission failed:', error);
      toast.error(formCopy.sendFailed);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error(formCopy.allFieldsRequired);
      return;
    }

    if (formData.subject.trim().length < 5) {
      toast.error(formCopy.subjectMinLength);
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.error(formCopy.messageMinLength);
      return;
    }

    submitContactMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">{formCopy.sentTitle}</h3>
            <p className="text-muted-foreground">
              {formCopy.thankYou}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {pageCopy.contactDirect}
        </CardTitle>
        <CardDescription>
          {pageCopy.contactFormInfo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {labels.name} *
              </label>
              <Input
                id="name"
                name="name"
                placeholder={labels.namePlaceholder}
                value={formData.name}
                onChange={handleChange}
                required
                minLength={5}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {labels.email} *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              {formCopy.subject} *
            </label>
            <Input
              id="subject"
              name="subject"
              placeholder={labels.subjectPlaceholder}
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              {formCopy.message} *
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder={labels.messagePlaceholder}
              value={formData.message}
              onChange={handleChange}
              rows={5}
              required
              minLength={10}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitContactMutation.isPending}
          >
            {submitContactMutation.isPending ? labels.sending : labels.send}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
