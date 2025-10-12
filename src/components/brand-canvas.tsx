"use client";

import { useState, useRef, useEffect, type FC } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import type { CardData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const CARD_WIDTH = 384; // w-96
const CARD_SPACING = 64;

// --- Sub-components for different card types ---

const BrandNameCard: FC<{
  onDone: (brandName: string) => void;
  isCompleted: boolean;
}> = ({ onDone, isCompleted }) => {
  const [name, setName] = useState("");
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">
          Let's start with your brand
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>What is the name of your brand or product?</p>
        <div className="flex space-x-2">
          <Input
            placeholder="e.g., 'Acmecorp'"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCompleted}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onDone(name)}
          />
          <Button
            onClick={() => onDone(name)}
            disabled={!name.trim() || isCompleted}
            className="bg-primary hover:bg-primary/90"
          >
            <Check className="h-4 w-4" />
            Done
          </Button>
        </div>
      </CardContent>
    </>
  );
};

const ElevatorPitchCard: FC<{
  onDone: (pitch: string) => void;
  isCompleted: boolean;
}> = ({ onDone, isCompleted }) => {
  const [pitch, setPitch] = useState("");
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">
          What's your elevator pitch?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Describe your brand in a few sentences.</p>
        <Textarea
          placeholder="e.g., 'Acmecorp provides high-quality, sustainable widgets for the modern consumer...'"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          disabled={isCompleted}
          rows={4}
        />
        <Button
          onClick={() => onDone(pitch)}
          disabled={!pitch.trim() || isCompleted}
          className="bg-primary hover:bg-primary/90"
        >
          <Check className="h-4 w-4" />
          Done
        </Button>
      </CardContent>
    </>
  );
};

const AudienceCard: FC<{
  onDone: (audience: string) => void;
  isCompleted: boolean;
}> = ({ onDone, isCompleted }) => {
  const [audience, setAudience] = useState("");

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">
          Who is the audience for your brand?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., 'Tech-savvy millennials who value design and sustainability...'"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          disabled={isCompleted}
          rows={4}
        />
        <Button
          onClick={() => onDone(audience)}
          disabled={!audience.trim() || isCompleted}
          className="bg-primary hover:bg-primary/90"
        >
          <Check className="h-4 w-4" />
          Done
        </Button>
      </CardContent>
    </>
  );
};

// --- Main Canvas Component ---

export default function BrandCanvas() {
  const [cards, setCards] = useState<CardData[]>([]);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const centerOnCard = (card: CardData) => {
    const { x, y, width, height } = card;
    const newPanX = -x + (window.innerWidth - width) / 2;
    const newPanY = -y + (window.innerHeight - height) / 2;

    animate(panX, newPanX, { duration: 0.8, ease: "easeInOut" });
    animate(panY, newPanY, { duration: 0.8, ease: "easeInOut" });
  };

  useEffect(() => {
    // Center the first card on mount
    const firstCard: CardData = {
      id: "brand-name",
      type: "brand-name",
      position: { x: 0, y: 0 },
      width: CARD_WIDTH,
      height: 200,
      data: {},
    };
    setCards([firstCard]);
    // We position the card at 0,0 and pan the canvas to center it.
    centerOnCard(firstCard);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      isPanning.current = true;
      panStart.current = {
        x: e.clientX - panX.get(),
        y: e.clientY - panY.get(),
      };
      e.currentTarget.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning.current) return;
    panX.set(e.clientX - panStart.current.x);
    panY.set(e.clientY - panStart.current.y);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning.current) {
      isPanning.current = false;
      if (e.currentTarget) {
        e.currentTarget.style.cursor = "grab";
      }
    }
  };

  const addCard = (newCard: CardData) => {
    setCards((prev) => [...prev, newCard]);
    centerOnCard(newCard);
  };

  const handleBrandNameDone = (brandName: string) => {
    setCards((cs) =>
      cs.map((c) =>
        c.id === "brand-name" ? { ...c, data: { ...c.data, completed: true } } : c
      )
    );
    const fromCard = cards.find((c) => c.id === "brand-name");
    if (!fromCard) return;

    addCard({
      id: "elevator-pitch",
      type: "elevator-pitch",
      position: {
        x: fromCard.position.x + fromCard.width + CARD_SPACING,
        y: fromCard.position.y,
      },
      width: CARD_WIDTH,
      height: 260,
      data: {},
      connections: ["brand-name"],
    });
  };

  const handlePitchDone = async (pitch: string) => {
    setCards((cs) =>
      cs.map((c) =>
        c.id === "elevator-pitch"
          ? { ...c, data: { ...c.data, completed: true } }
          : c
      )
    );
    const fromCard = cards.find((c) => c.id === "elevator-pitch");
    if (!fromCard) return;

    const audienceCard: CardData = {
      id: "audience",
      type: "audience",
      position: {
        x: fromCard.position.x,
        y: fromCard.position.y + fromCard.height + CARD_SPACING,
      },
      width: CARD_WIDTH,
      height: 260,
      data: {},
      connections: ["elevator-pitch"],
    };
    addCard(audienceCard);
  };

  const handleAudienceDone = (audience: string) => {
    setCards((cs) =>
      cs.map((c) =>
        c.id === "audience" ? { ...c, data: { ...c.data, completed: true } } : c
      )
    );
  };

  const getCardComponent = (card: CardData) => {
    switch (card.type) {
      case "brand-name":
        return (
          <BrandNameCard
            onDone={handleBrandNameDone}
            isCompleted={!!card.data.completed}
          />
        );
      case "elevator-pitch":
        return (
          <ElevatorPitchCard
            onDone={handlePitchDone}
            isCompleted={!!card.data.completed}
          />
        );
      case "audience":
        return (
          <AudienceCard
            onDone={handleAudienceDone}
            isCompleted={!!card.data.completed}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen overflow-hidden relative bg-background canvas-bg cursor-grab"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ x: panX, y: panY }}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              style={{
                position: "absolute",
                left: card.position.x,
                top: card.position.y,
                width: card.width,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="shadow-2xl">{getCardComponent(card)}</Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.g style={{ x: panX, y: panY }}>
          <AnimatePresence>
            {cards.map((card) =>
              card.connections?.map((connId) => {
                const fromCard = cards.find((c) => c.id === connId);
                if (!fromCard) return null;

                // Adjust for card centering if needed by your layout logic
                const x1 = fromCard.position.x + fromCard.width;
                const y1 = fromCard.position.y + fromCard.height / 2;
                const x2 = card.position.x;
                const y2 = card.position.y + card.height / 2;

                const pathData = `M ${x1} ${y1} C ${
                  x1 + CARD_SPACING / 2
                } ${y1}, ${x2 - CARD_SPACING / 2} ${y2}, ${x2} ${y2}`;

                return (
                  <motion.path
                    key={`${fromCard.id}-${card.id}`}
                    d={pathData}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.5,
                      ease: "easeInOut",
                    }}
                  />
                );
              })
            )}
          </AnimatePresence>
        </motion.g>
      </svg>
    </div>
  );
}
