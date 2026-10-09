export function RevealWords({ text }: { text: string }) {
    return (
        <span>
            {text.split(' ').map((word, index) => (
                <span
                    key={`${word}-${index}`}
                    className="animate-in fade-in slide-in-from-bottom-1 mr-[0.25em] inline-block duration-500"
                >
                    {word}
                </span>
            ))}
        </span>
    );
}
