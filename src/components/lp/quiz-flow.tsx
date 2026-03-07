"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, CheckCircle2 } from "lucide-react";

const steps = [
    {
        id: "cuisine_category",
        title: "What type of cuisine do you serve?",
        options: ["Asian", "European & Mediterranean", "Middle Eastern", "Latin American", "Modern Australian / Fusion", "Cafe / Brunch", "Other"],
        canSkip: true,
    },
    {
        id: "cuisine_detail",
        title: "Specifically, what's your specialty?",
        optionsByPrev: {
            "Asian": ["Chinese", "Vietnamese", "Thai", "Japanese", "Korean", "Indian", "Malaysian", "Filipino", "Indonesian", "Sri Lankan", "Nepalese", "Other"],
            "European & Mediterranean": ["Italian", "Greek", "French", "Spanish", "Turkish", "Modern European", "Other"],
            "Middle Eastern": ["Lebanese", "Persian", "Afghan", "Moroccan", "Other"],
            "Latin American": ["Mexican", "Brazilian", "Peruvian", "Other"],
        },
        canSkip: true,
    },
    {
        id: "location",
        title: "Where is your restaurant located?",
        options: ["Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide", "Other"],
        canSkip: true,
    },
    {
        id: "headache",
        title: "What is your biggest daily headache?",
        options: ["High staffing costs", "Language barrier / Order mistakes", "Low profit margins", "Customers waiting too long"],
        canSkip: true,
    },
    {
        id: "tables",
        title: "How many tables do you have?",
        options: ["1-10", "11-20", "21-30", "30+"],
        canSkip: true,
    },
    {
        id: "customers",
        title: "How many customers do you serve daily?",
        options: ["Under 50", "50-100", "100-200", "200+"],
        canSkip: true,
    },
    {
        id: "current_ordering",
        title: "How do you take orders now?",
        options: ["Pen and paper", "Verbally", "POS system", "Already using QR ordering", "Other"],
        canSkip: true,
    },
    {
        id: "interest_3d",
        title: "Increase sales with 3D set menus?",
        options: ["Yes, absolutely!", "Interested, tell me more"],
        canSkip: true,
    },
];

export const QuizFlow = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isFinished, setIsFinished] = useState(false);

    const handleOptionSelect = (option: string) => {
        const step = steps[currentStep];
        setAnswers(prev => ({ ...prev, [step.id]: option }));

        // Skip Step 1b if no sub-options
        if (step.id === "cuisine_category") {
            const details = (steps[1].optionsByPrev as any)[option];
            if (!details) {
                setCurrentStep(currentStep + 2);
                return;
            }
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleSkip = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsFinished(true);
        }
    };

    const currentStepData = steps[currentStep];
    const options = currentStepData?.options || (currentStepData?.optionsByPrev as any)?.[answers["cuisine_category"]] || [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                layoutId="quiz-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-12">
                    {!isFinished ? (
                        <div>
                            <div className="flex gap-1 mb-8">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1 flex-grow rounded-full transition-colors ${idx <= currentStep ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}
                                    />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">{currentStepData.title}</h3>

                                    <div className="grid grid-cols-1 gap-3">
                                        {options.map((option: string) => (
                                            <button
                                                key={option}
                                                onClick={() => handleOptionSelect(option)}
                                                className="w-full p-5 text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all font-medium flex justify-between items-center group"
                                            >
                                                {option}
                                                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>

                                    {currentStepData.canSkip && (
                                        <button
                                            onClick={handleSkip}
                                            className="mt-8 text-neutral-400 hover:text-black dark:hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Skip this question
                                        </button>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4 tracking-tight">Analysis Complete!</h3>
                            <p className="text-xl text-muted-foreground mb-8">
                                {answers["tables"] === "1-10"
                                    ? "Based on your size, you can run the floor more efficiently with zero order mistakes."
                                    : "Our system is designed to reduce your staffing pressure and boost your average order value."}
                            </p>

                            <div className="space-y-4 max-w-sm mx-auto">
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-transparent"
                                />
                                <button className="btn-primary w-full shadow-none text-lg">Send My Custom Strategy</button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
