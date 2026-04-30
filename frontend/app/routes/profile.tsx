import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getSetups } from "~/api/setup";
import type { ApiSetupListItem } from "~/api/types";

export default function Profile() {
  const [setups, setSetups] = useState<ApiSetupListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSetups()
      .then(setSetups)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          fontSize: 11,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          fontFamily: "var(--font-sans)",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px" }}>
      <p
        style={{
          fontSize: 11,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          fontFamily: "var(--font-sans)",
          marginBottom: 16,
        }}
      >
        My Setups
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {setups.map((setup) => (
          <div
            key={setup.id}
            style={{
              background: "#161616",
              border: "1px solid #222",
            }}
          >
            <img
              src={setup.imageUrl}
              alt={setup.name}
              style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
            />
            <div style={{ padding: "10px 10px 8px" }}>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#e8e8e8",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {setup.name}
              </p>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "#555",
                  fontFamily: "var(--font-sans)",
                  margin: "4px 0 0",
                }}
              >
                ELO {setup.rating} · {setup.wins}W · {setup.losses}L
              </p>
            </div>
          </div>
        ))}

        {/* Add Setup shortcut — always last */}
        <Link
          to="/submit"
          style={{
            background: "#161616",
            border: "1px dashed #333",
            aspectRatio: "1/1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textDecoration: "none",
            color: "#555",
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>+</span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "var(--font-sans)",
            }}
          >
            Add Setup
          </span>
        </Link>
      </div>
    </div>
  );
}