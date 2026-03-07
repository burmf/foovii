import Link from "next/link";

export function CTA() {
    return (
        <section className="py-24 md:py-32">
            <div className="lp-container text-center">
                <div className="glass-card p-12 md:p-20 rounded-[3rem] space-y-8 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">Ready to transform your guest experience?</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Join the future of dining. Setup is fast, and the impact is instant.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/signup" className="btn-primary w-full sm:w-auto text-center">Create Your Account</Link>
                        <Link href="/demo" className="btn-secondary w-full sm:w-auto text-center">View Interactive Demo</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
