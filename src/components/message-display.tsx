import type { DatasetMessage } from "@/types/dataset";
import Image from "next/image";

interface MessageDisplayProps {
	messages: DatasetMessage[];
	className?: string;
}

export function MessageDisplay({
	messages,
	className = "",
}: MessageDisplayProps) {
	return (
		<div className={`space-y-1 text-sm ${className}`}>
			{messages.map((msg, idx) => {
				const contentKey =
					typeof msg.content === "string"
						? msg.content.slice(0, 20)
						: msg.content
								.map(part =>
									part.type === "text"
										? part.text.slice(0, 20)
										: part.image.slice(0, 20),
								)
								.join("-");
				return (
					<div
						key={`${msg.role}-${contentKey}-${idx}`}
						className="space-y-1"
					>
						{typeof msg.content === "string" ? (
							<p>
								<b>{msg.role}:</b> {msg.content}
							</p>
						) : (
							<div className="flex flex-col gap-2">
								{msg.content.map((part, partIdx) =>
									part.type === "text" ? (
										<p key={`${part.text}-${partIdx}`}>
											<b>{msg.role}:</b> {part.text}
										</p>
									) : (
										<Image
											key={`${part.image}-${partIdx}`}
											src={part.image}
											alt=""
											width={200}
											height={200}
											className="rounded-md"
										/>
									),
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
