import { CheckIcon } from './Icons';

interface StepIndicatorProps {
    currentStep: number; // 1, 2, or 3
}

const steps = [
    { number: 1, label: 'อัปโหลดไฟล์' },
    { number: 2, label: 'ตรวจสอบและเลือกข้อมูล' },
    { number: 3, label: 'สร้างหนังสือรับรอง' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="step-indicator">
            {steps.map((step, index) => (
                <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={`step ${currentStep === step.number ? 'active' :
                        currentStep > step.number ? 'completed' : ''
                        }`}>
                        <div className="step-circle">
                            {currentStep > step.number ? <CheckIcon size={18} /> : step.number}
                        </div>
                        <span className="step-label">{step.label}</span>
                    </div>

                    {index < steps.length - 1 && (
                        <div className={`step-line ${currentStep > step.number ? 'completed' : ''}`} />
                    )}
                </div>
            ))}
        </div>
    );
}
