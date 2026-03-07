import {
    Nav,
    Hero,
    Benefits,
    HowItWorks,
    Pricing,
    FAQ,
    CTA,
    Footer
} from "../../components/lp";

export default function LP() {
    return (
        <div className="min-h-screen bg-background selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            <Nav />
            <main>
                <Hero />
                <Benefits />
                <HowItWorks />
                <Pricing />
                <FAQ />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
