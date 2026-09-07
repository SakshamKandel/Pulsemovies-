export function PageHeading({ title, eyebrow, description }: { title: string; eyebrow: string; description: string }) {
    return <div className="mb-8 border-b border-white/10 pb-7 pt-3">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">{title}</h1>
        <p className="text-sm md:text-base text-zinc-400 max-w-2xl mt-3 leading-relaxed">{description}</p>
    </div>;
}
