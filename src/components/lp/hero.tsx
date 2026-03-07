import Link from "next/link";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[150px] -z-10" />

            <div className="lp-container text-center space-y-12">
                <div className="space-y-6 max-w-4xl mx-auto">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold tracking-[0.2em] uppercase">
                        The Future of Dining
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                        <span className="text-gradient">Visualize the Flavor.</span>
                        <br />
                        Next-Gen QR Ordering.
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Foovii combines the simplicity of QR codes with immersive 3D and AR experiences.
                        Delight your guests before the first bite.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/demo" className="btn-primary w-full sm:w-auto text-center">
                        Try Live Demo
                    </Link>
                    <Link href="#pricing" className="btn-secondary w-full sm:w-auto text-center">
                        View Pricing
                    </Link>
                </div>

                {/* Hero Visual Mockup */}
                <div className="relative mt-20 mx-auto max-w-5xl">
                    <div className="glass-card rounded-[2rem] p-4 lg:p-8 aspect-video flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 rounded-2xl flex flex-col items-center justify-center text-muted-foreground relative group">
                            {/* 3D Model Placeholder and Animation Hint */}
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">🍱</div>
                            <p className="text-sm font-medium tracking-widest uppercase text-center">3D Viewer Interactive Preview</p>
                            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-none" />
                        </div>
                    </div>
                    {/* Subtle decoration elements */}
                    <div className="absolute -top-6 -right-6 w-12 h-12 glass-card rounded-xl flex items-center justify-center text-xl shadow-xl">✨</div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 glass-card rounded-2xl flex items-center justify-center text-4xl shadow-2xl opacity-50">📱</div>
                </div>
            </div>
        </section>
    );
}
