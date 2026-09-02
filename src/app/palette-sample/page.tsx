import { twBackgroundPaletteColors } from "@/src/components/ui/tw-background-palette-colors";

export default function PaletteSamplePage() {
	return (
		<main className="min-h-screen bg-black px-6 py-10 text-white">
			<div className="mx-auto max-w-3xl">
				<h1 className="mb-8 text-3xl font-bold">In Dark Mode</h1>

				<div className="space-y-6">
					{Object.entries(twBackgroundPaletteColors).map(
						([paletteName, hexCode]) => (
							<section key={paletteName}>
								<div className="mb-2 flex items-baseline gap-3">
									<h2 className="font-mono text-sm">{paletteName}</h2>
									<span className="font-mono text-sm text-gray-300">
										{hexCode}
									</span>
								</div>
								<div
									className="h-[50px] w-[300px] max-w-full border border-white"
									style={{ backgroundColor: hexCode }}
									aria-label={`${paletteName} ${hexCode}`}
								/>
							</section>
						),
					)}
				</div>
			</div>
		</main>
	);
}
