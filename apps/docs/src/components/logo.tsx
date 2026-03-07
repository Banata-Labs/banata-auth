import { cn } from "@/lib/utils";

const MAIN_PATH =
	"M 225 70 L 135 70 A 35 35 0 0 0 100 105 L 100 295 A 35 35 0 0 0 135 330 L 265 330 A 35 35 0 0 0 300 295 L 300 145";
const ARC_PATH =
	"M 300 120 L 300 105 A 35 35 0 0 0 265 70 L 250 70";
const DOT_CX = 152;
const DOT_CY = 276;
const DOT_R = 28;
const STROKE_W = 20;
const TEAL = "#00867A";

interface LogoMarkProps {
	className?: string;
	size?: number;
}

export function LogoMark({ className, size = 28 }: LogoMarkProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 400 400"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("shrink-0", className)}
			aria-label="Banata"
		>
			<path
				d={MAIN_PATH}
				stroke="currentColor"
				strokeWidth={STROKE_W}
				strokeLinecap="butt"
				fill="none"
			/>
			<path
				d={ARC_PATH}
				stroke="currentColor"
				strokeWidth={STROKE_W}
				strokeLinecap="butt"
				fill="none"
			/>
			<circle cx={DOT_CX} cy={DOT_CY} r={DOT_R} fill={TEAL} />
		</svg>
	);
}

interface LogoProps {
	className?: string;
	size?: number;
	showText?: boolean;
}

export function Logo({ className, size = 28, showText = true }: LogoProps) {
	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<LogoMark size={size} />
			{showText && (
				<span className="text-[15px] font-semibold tracking-tight">Banata</span>
			)}
		</div>
	);
}
