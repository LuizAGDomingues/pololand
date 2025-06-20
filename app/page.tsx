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

// Substituir o tipo do estado clouds para um array de objetos simples
interface Cloud {
  id: number;
  top: number; // porcentagem
  direction: 'right' | 'left';
  duration: number; // segundos
}

export default function Ranking() {
  // Usamos a interface PlayerWithImage para o estado
  const [players, setPlayers] = useState<PlayerWithImage[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([])

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
        const combinedData = playersData.map((player) => {
          const personagem = (personagensData as Personagem[]).find(
            (p) => p.nome === player.nome_consultor
          );
  
          return {
            ...player,
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
  
    const addClouds = () => {
      const numClouds = 1 + Math.floor(Math.random() * 2); // 1 ou 2
      const newClouds: Cloud[] = Array.from({ length: numClouds }, (_, i) => {
        const direction = Math.random() < 0.5 ? 'right' : 'left';
        const duration = 10 + Math.random() * 10; // entre 10s e 20s
        const id = Date.now() + Math.random();
        // Agenda remoção da nuvem após o tempo de animação
        setTimeout(() => {
          setClouds((prev) => prev.filter((cloud) => cloud.id !== id));
        }, duration * 1000);
        return {
          id,
          top: 20 + Math.random() * 60,
          direction,
          duration,
        };
      });
      setClouds((prev) => [...prev, ...newClouds]);
    };
    const cloudInterval = setInterval(addClouds, 10000);
    // Inicializa com 1 ou 2 nuvens
    addClouds();
    return () => clearInterval(cloudInterval);
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
        overflow: "hidden", // Importante para as nuvens não criarem scroll
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

      {/* Container para as nuvens animadas */}
      <div className="cloudContainer">
        {clouds.map((cloud) => (
          <img
            key={cloud.id}
            src="/nuvem.png"
            alt="Nuvem"
            className={`cloud ${cloud.direction}`}
            style={{
              top: `${cloud.top}%`,
              zIndex: 2,
              animationDuration: `${cloud.duration}s`,
            }}
          />
        ))}
      </div>

      <audio id="theme-music" src="/themeMusic.mp3" hidden />

      {/* Conteúdo Principal da Página */}
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

      {/* Container para as imagens dos personagens */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "150px",
          zIndex: 3,
        }}
      >
        {players.map((player, index) =>
          player.imageUrl ? (
            <img
              key={`char-${player.nome_consultor}`}
              src={player.imageUrl}
              alt={player.nick_consultor}
              className="character-image"
              style={{
                position: 'absolute',
                left: `${player.percentual}%`,
                bottom: "60px",
                transform: 'translateX(-50%)',
                animationDelay: `${index * 0.3}s`,
              }}
            />
          ) : null
        )}
      </div>
    </div>
  );
}