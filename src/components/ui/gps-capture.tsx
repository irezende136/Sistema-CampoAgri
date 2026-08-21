"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

// Precisão considerada suficiente para parar de refinar (metros).
const TARGET_ACCURACY_M = 10;
// Tempo máximo refinando antes de aceitar a melhor leitura obtida.
const MAX_REFINE_MS = 25000;

type Fix = { lat: number; lon: number; accuracy: number };

function accuracyTone(accuracy: number) {
  if (accuracy <= 10) return { label: "ótima", className: "text-success" };
  if (accuracy <= 30) return { label: "boa", className: "text-success" };
  if (accuracy <= 100) return { label: "razoável", className: "text-warning" };
  return { label: "fraca", className: "text-danger" };
}

export function GpsCapture({
  latitude,
  longitude,
  onChange,
  hint = "Registre as coordenadas estando no local para gerar o link de navegação (Waze/Google Maps).",
}: {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lon: string) => void;
  hint?: string;
}) {
  const [locating, setLocating] = useState(false);
  const [best, setBest] = useState<Fix | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bestRef = useRef<Fix | null>(null);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLocating(false);
  }, []);

  // Garante que o GPS não fique ligado se o usuário sair da tela.
  useEffect(() => stopWatching, [stopWatching]);

  function handleCapture() {
    if (!navigator.geolocation) {
      setError("Seu navegador não suporta localização.");
      return;
    }

    setLocating(true);
    setError(null);
    setBest(null);
    bestRef.current = null;

    // watchPosition (e não getCurrentPosition): a primeira leitura costuma vir
    // da rede/Wi-Fi, com centenas de metros de erro. Ficamos ouvindo e sempre
    // guardamos a leitura mais precisa até bater a meta ou estourar o tempo.
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const fix: Fix = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        if (!bestRef.current || fix.accuracy < bestRef.current.accuracy) {
          bestRef.current = fix;
          setBest(fix);
          onChange(fix.lat.toFixed(6), fix.lon.toFixed(6));
        }

        if (fix.accuracy <= TARGET_ACCURACY_M) stopWatching();
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Permissão de localização negada. Autorize o acesso nas configurações do navegador."
            : err.code === err.POSITION_UNAVAILABLE
              ? "Sinal de GPS indisponível. Tente a céu aberto."
              : "Não foi possível obter a localização."
        );
        stopWatching();
      },
      { enableHighAccuracy: true, timeout: MAX_REFINE_MS, maximumAge: 0 }
    );

    timerRef.current = setTimeout(stopWatching, MAX_REFINE_MS);
  }

  const tone = best ? accuracyTone(best.accuracy) : null;

  return (
    <div>
      <p className="block text-sm font-medium mb-1.5">Coordenadas GPS</p>
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="latitude"
          type="number"
          step="0.000001"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => onChange(e.target.value, longitude)}
        />
        <Input
          name="longitude"
          type="number"
          step="0.000001"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => onChange(latitude, e.target.value)}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={handleCapture} disabled={locating}>
          {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
          {locating ? "Buscando sinal..." : best ? "Medir novamente" : "Usar minha localização atual"}
        </Button>

        {locating && (
          <Button type="button" variant="ghost" size="sm" onClick={stopWatching}>
            <X size={16} /> Parar e usar esta
          </Button>
        )}

        {best && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone!.className}`}>
            {!locating && best.accuracy <= TARGET_ACCURACY_M && <Check size={14} />}
            Precisão {tone!.label}: ±{Math.round(best.accuracy)} m
          </span>
        )}
      </div>

      {locating && (
        <p className="mt-1 text-xs text-muted-foreground">
          Aguarde alguns segundos parado, a céu aberto — a precisão melhora conforme o GPS trava nos satélites.
        </p>
      )}
      {!locating && best && best.accuracy > TARGET_ACCURACY_M && (
        <p className="mt-1 text-xs text-muted-foreground">
          Para melhorar, afaste-se de construções e árvores densas e toque em &quot;Medir novamente&quot;.
        </p>
      )}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {!locating && !best && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
