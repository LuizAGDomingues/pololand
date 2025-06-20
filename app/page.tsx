"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 1. IMPORTAR O ARQUIVO JSON
// Certifique-se de que o caminho para o arquivo JSON está correto
// em relação à localização deste componente.
import personagensData from "../app/personagens.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const colors = ["pink", "red", "blue", "green", "orange", "yellow", "purple", "cyan"];

// Definindo uma interface para os dados dos personagens para melhor type-safety
interface Personagem {
  nome: string;
  url: string;
}

// Definindo a interface para os dados combinados dos jogadores
interface PlayerWithImage {
  nome_consultor: string;
  nick_consultor: string;
  percentual: number;
  imageUrl?: string; // A URL da imagem pode ser opcional
}

export default function Ranking() {
  // Usamos a interface PlayerWithImage para o estado
  const [players, setPlayers] = useState<PlayerWithImage[]>([]);

  useEffect(() => {
    async function fetchAndProcessPlayers() {
      const { data: playersData, error } = await supabase
        .from("players")
        .select("nome_consultor, nick_consultor, percentual")
        .order("percentual", { ascending: false });

      if (error) {
        console.error("Erro ao buscar jogadores:", error);
        return;
      }

      if (playersData) {
        // 2. MESCLAR DADOS DO SUPABASE COM O JSON
        const combinedData = playersData.map((player) => {
          // Encontra o personagem correspondente no JSON
          const personagem = (personagensData as Personagem[]).find(
            (p) => p.nome === player.nome_consultor
          );
          
          return {
            ...player,
            // Adiciona a URL da imagem ao objeto do jogador
            imageUrl: personagem ? personagem.url : undefined,
          };
        });
        setPlayers(combinedData);
      }
    }

    fetchAndProcessPlayers();

    const audio = document.getElementById("theme-music") as HTMLAudioElement;
    if (audio) {
      setTimeout(() => {
        audio.play().catch((error) => {
          console.error("Erro ao tentar tocar o áudio automaticamente:", error);
        });
      }, 5000);
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "url('/bg-pixel.png') center/cover no-repeat, #7ec0ee",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden", // Importante para não criar scrollbars com as imagens
      }}
    >
      {/* Camada de opacidade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(128, 128, 128, 0.3)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <audio id="theme-music" src="/themeMusic.mp3" hidden />
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <img src="/tituloPololand.png" alt="Poloand" style={{ width: 210, margin: "10px auto" }} />
        <img src="/subtitulo.png" alt="High Scores" style={{ width: 600, margin: "auto", animation: "pulsar 4s ease-in-out infinite" }} />
        <div style={{ marginTop: 6 }}>
          {players.map((player, idx) => (
            <div
              key={player.nome_consultor}
              className={`player-entry ${idx === 0 ? 'first-place' : ''}`}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 24,
                marginBottom: 10,
                gap: 12,
                animationDelay: `${idx * 0.2}s`
              }}
            >
              {idx === 0 && (
                <img
                  src="/coroa.png"
                  alt="Coroa do primeiro lugar"
                  style={{ width: '34px' }}
                  className="crown-icon"
                />
              )}
              <span className={`pixel-font ${colors[idx % colors.length]}`}>
                {player.nick_consultor} ({player.nome_consultor})
              </span>
              <span className={`pixel-font ${colors[idx % colors.length]}`}>
                {player.percentual}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CONTAINER PARA AS IMAGENS DOS PERSONAGENS */}
      <div
        style={{
          position: "absolute",
          bottom: 0, // Fixa na parte inferior
          left: 0,
          width: "100%",
          height: "150px", // Altura do container, ajuste conforme necessário
          zIndex: 3, // Garante que fique acima da opacidade
        }}
      >
        {players.map((player, index) =>
          player.imageUrl ? (
            <img
              key={`char-${player.nome_consultor}`}
              src={player.imageUrl}
              alt={player.nick_consultor}
              // APLICANDO A CLASSE CSS
              className="character-image" 
              style={{
                // ESTILO INLINE APENAS PARA O QUE É DINÂMICO
                position: 'absolute',
                left: `${player.percentual}%`,
                bottom: "60px",
                transform: 'translateX(-50%)', // Centraliza a imagem no percentual
                animationDelay: `${index * 0.3}s`, // Atraso dinâmico para cada personagem
              }}
            />
          ) : null
        )}
      </div>
    </div>
  );
}