import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * Shared visual shell for every auth page (Register, Login, Reset
 * Password, ...). Keeps spacing, animation, and card styling identical
 * across the whole auth flow instead of each page reimplementing it.
 */
export function AuthCard({ title, description, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <p className="mb-8 text-center font-display text-lg font-semibold tracking-tight text-foreground">
          E-Library
        </p>

        <Card className="shadow-elevated">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-display text-2xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </motion.div>
    </div>
  );
}
