"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const colors = ["pink", "yellow", "green", "orange"];

export default function Ranking() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlayers() {
      const { data } = await supabase
        .from("players")
        .select("nome_consultor, nick_consultor, percentual")
        .order("percentual", { ascending: false });
      setPlayers(data || []);
    }
    fetchPlayers();

    // Tentar tocar o áudio após um pequeno atraso
    const audio = document.getElementById("theme-music") as HTMLAudioElement;
    if (audio) {
      // Usar setTimeout para dar tempo ao DOM carregar e talvez "enganar" algumas restrições
      setTimeout(() => {
        audio.play().catch((error) => {
          console.error("Erro ao tentar tocar o áudio automaticamente:", error);
          // Mensagem para o usuário se o autoplay falhar: "Por favor, clique em qualquer lugar para ativar o áudio."
        });
      }, 3500); // Tentar após 500ms
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "url('/bg-pixel.png') center/cover no-repeat, #7ec0ee",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <audio id="theme-music" src="/themeMusic.mp3" hidden />
      <div style={{ textAlign: "center" }}>
        <img src="/tituloPololand.png" alt="Poloand" style={{ width: 300, margin: "10px auto" }} />
        <img src="/subtitulo.png" alt="Poloand" style={{ width: 700, margin: "auto" }} />
        <div>
          {players.map((player, idx) => (
            <div
              key={player.nome_consultor}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 28,
                marginBottom: 4,
                gap: 24,
              }}
            >
              <span className={`pixel-font ${colors[idx % colors.length]}`}>{
                player.nick_consultor } ({player.nome_consultor})</span>
              <span className={`pixel-font ${colors[idx % colors.length]}`}>{
                player.percentual
              }%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
