"use client";
import { useState } from "react";
import { Nav, Hero, Benefits, HowItWorks, Pricing, FAQ, QuizFlow, BottomCTA, Footer } from "@/components/lp";

export default function LPPagination() {
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    return (
        <main className="min-h-screen bg-white dark:bg-black">
            <Nav />
            <Hero />
            <Benefits />
            <HowItWorks />
            <Pricing />
            <FAQ />
            <BottomCTA onOpenQuiz={() => setIsQuizOpen(true)} />
            <Footer />

            <QuizFlow isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
        </main>
    );
}
