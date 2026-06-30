"use client";

export default function TestMapPage() {
  const lat = 53.3498; // Dublin example
  const lng = -6.2603;

  return (
    <div style={{ padding: 20 }}>
      <h2>Map Test</h2>

      <iframe
        width="300"
        height="300"
        loading="lazy"
        style={{ border: 0, borderRadius: 12 }}
        src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
      />

      <p style={{ marginTop: 10 }}>
        Lat: {lat} | Lng: {lng}
      </p>
    </div>
  );
}