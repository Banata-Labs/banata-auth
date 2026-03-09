"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
	const _values = React.useMemo(() => value ?? defaultValue ?? [min], [value, defaultValue, min]);
	const thumbs = React.useMemo(() => {
		const counts = new Map<number, number>();
		return _values.map((thumbValue) => {
			const nextCount = (counts.get(thumbValue) ?? 0) + 1;
			counts.set(thumbValue, nextCount);
			return { thumbValue, key: `${thumbValue}-${nextCount}` };
		});
	}, [_values]);

	return (
		<SliderPrimitive.Root
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			className={cn(
				"relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className="bg-muted relative h-1.5 w-full grow overflow-hidden rounded-full"
			>
				<SliderPrimitive.Range data-slot="slider-range" className="bg-primary absolute h-full" />
			</SliderPrimitive.Track>
			{thumbs.map((thumb) => (
				<SliderPrimitive.Thumb
					data-slot="slider-thumb"
					key={thumb.key}
					className="border-primary bg-background focus-visible:ring-ring/50 block size-4 rounded-full border shadow-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-hidden disabled:pointer-events-none"
				/>
			))}
		</SliderPrimitive.Root>
	);
}

export { Slider };
