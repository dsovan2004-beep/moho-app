import CityPhoto from "./CityPhoto";
export default function ResidentCityVisual({ city }: { city: string }) {
  if (city === "Mountain House" || city === "Tracy" || city === "Lathrop")
    return <CityPhoto city={city} className="h-72 rounded-none" />;
  return (
    <div className="flex h-72 flex-col justify-end bg-[#e7eee5] p-7 text-[#19352d]">
      <p className="text-xs font-bold uppercase tracking-widest">
        Your new neighborhood
      </p>
      <p className="mt-3 text-3xl font-extrabold">Hello, {city}.</p>
      <p className="mt-3 text-sm leading-relaxed">
        Start with the essentials.
        <br />
        Make room for local connections.
      </p>
      <p className="mt-4 text-xs">
        Local photography pending reuse-rights verification.
      </p>
    </div>
  );
}
