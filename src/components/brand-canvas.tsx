"use client";

import { useState, useRef, useEffect, type FC } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import {
  collection,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Loader2, Sparkles } from "lucide-react";
import type { CardData } from "@/lib/types";
import { getTaglineSuggestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase";

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

const TaglineCard: FC<{
  taglines: string[];
  isLoading: boolean;
}> = ({ taglines, isLoading }) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="text-primary" />
          AI Generated Taglines
        </CardTitle>
        <CardDescription>
          Here are a few tagline ideas to get you started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="space-y-2 list-disc list-inside">
            {taglines.map((tagline, i) => (
              <li key={i}>{tagline}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </>
  );
};

const ExistingBrandCard: FC<{ brand: any }> = ({ brand }) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">{brand.latestName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-bold text-sm text-muted-foreground">
            Elevator Pitch
          </h4>
          <p className="text-sm">{brand.latestElevatorPitch}</p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-muted-foreground">
            Target Audience
          </h4>
          <p className="text-sm">{brand.latestAudience}</p>
        </div>
      </CardContent>
    </>
  );
};

// --- Main Canvas Component ---

export default function BrandCanvas() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { user } = useUser();
  const firestore = useFirestore();

  const brandsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/brands`) : null),
    [user, firestore]
  );
  const { data: brands, isLoading: isLoadingBrands } =
    useCollection(brandsQuery);

  useEffect(() => {
    if (brands) {
      const existingBrandCards: CardData[] = brands.map((brand, index) => ({
        id: `existing-brand-${brand.id}`,
        type: "existing-brand",
        position: { x: index * (CARD_WIDTH + CARD_SPACING), y: -400 },
        width: CARD_WIDTH,
        height: 250,
        data: brand,
      }));
      setCards((prev) => [
        ...prev.filter((c) => c.type !== "existing-brand"),
        ...existingBrandCards,
      ]);
    }
  }, [brands]);

  const centerOnCard = (card: CardData) => {
    if (!containerRef.current) return;

    const newPanX =
      -card.position.x +
      (containerRef.current.clientWidth - card.width) / 2;
    const newPanY =
      -card.position.y +
      (containerRef.current.clientHeight - card.height) / 2;

    animate(panX, newPanX, { duration: 0.8, ease: "easeInOut" });
    animate(panY, newPanY, { duration: 0.8, ease: "easeInOut" });
  };

  useEffect(() => {
    // Center the view on initial load
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      panX.set(containerWidth / 2 - CARD_WIDTH / 2);
      panY.set(containerHeight / 2 - 100);
    }
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

  const handleCreateNewBrand = () => {
    setIsCreatingBrand(true);
    // Remove other creation flows if any
    const nonCreationCards = cards.filter(
      (c) => c.type === "existing-brand"
    );
    const firstCard: CardData = {
      id: "brand-name",
      type: "brand-name",
      position: { x: 0, y: 0 },
      width: CARD_WIDTH,
      height: 200,
      data: {},
    };
    setCards([...nonCreationCards, firstCard]);
    setTimeout(() => centerOnCard(firstCard), 100);
  };

  const addCard = (newCard: CardData) => {
    setCards((prev) => [...prev, newCard]);
    setTimeout(() => centerOnCard(newCard), 100);
  };

  const updateCardData = (cardId: string, data: { [key: string]: any }) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, data: { ...c.data, ...data } } : c))
    );
  };

  const handleBrandNameDone = (brandName: string) => {
    setCards((cs) =>
      cs.map((c) =>
        c.id === "brand-name"
          ? { ...c, data: { ...c.data, name: brandName, completed: true } }
          : c
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
          ? { ...c, data: { ...c.data, pitch: pitch, completed: true } }
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

  const handleAudienceDone = async (audience: string) => {
    if (!user || !firestore) return;
  
    setCards((cs) =>
      cs.map((c) =>
        c.id === "audience"
          ? { ...c, data: { ...c.data, completed: true } }
          : c
      )
    );
  
    const nameCard = cards.find((c) => c.type === "brand-name");
    const pitchCard = cards.find((c) => c.type === "elevator-pitch");
    const brandName = nameCard?.data.name;
    const elevatorPitch = pitchCard?.data.pitch;
  
    if (!brandName || !elevatorPitch) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Brand name or elevator pitch is missing.",
      });
      return;
    }
  
    const fromCard = cards.find((c) => c.id === "audience");
    if (!fromCard) return;
  
    const taglineCard: CardData = {
      id: "taglines",
      type: "taglines",
      position: {
        x: fromCard.position.x - fromCard.width - CARD_SPACING,
        y: fromCard.position.y,
      },
      width: CARD_WIDTH,
      height: 280,
      data: { isLoading: true, taglines: [] },
      connections: ["audience"],
    };
    addCard(taglineCard);
  
    try {
      const brandData = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        latestName: brandName,
        latestElevatorPitch: elevatorPitch,
        latestAudience: audience,
      };
      const brandsCollection = collection(firestore, `users/${user.uid}/brands`);
      const brandDocRef = await addDocumentNonBlocking(brandsCollection, brandData);
  
      if (!brandDocRef) {
        throw new Error("Failed to create brand document. It returned undefined.");
      }
  
      const suggestionResult = await getTaglineSuggestions(
        brandName,
        elevatorPitch,
        audience
      );
  
      if (suggestionResult.success && suggestionResult.data) {
        updateCardData(taglineCard.id, {
          isLoading: false,
          taglines: suggestionResult.data,
        });
        const taglinesCollection = collection(brandDocRef, "taglineGenerations");
        for (const tagline of suggestionResult.data) {
          addDocumentNonBlocking(taglinesCollection, {
            brandId: brandDocRef.id,
            userId: user.uid,
            tagline: tagline,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        throw new Error(suggestionResult.error || "Failed to get suggestions.");
      }
    } catch (error) {
      console.error("Error during brand creation and tagline generation:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description:
          (error as Error).message ||
          "Could not save brand or generate taglines.",
      });
      updateCardData(taglineCard.id, { isLoading: false });
    }
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
      case "taglines":
        return (
          <TaglineCard
            isLoading={card.data.isLoading}
            taglines={card.data.taglines}
          />
        );
      case "existing-brand":
        return <ExistingBrandCard brand={card.data} />;
      default:
        return null;
    }
  };

  const creationFlowInProgress = cards.some((c) => c.type !== "existing-brand");

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

      {!creationFlowInProgress && (
        <div className="absolute inset-0 flex items-center justify-center">
          {isLoadingBrands ? (
            <Button size="lg" disabled>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading Brands...
            </Button>
          ) : (
            <Button size="lg" onClick={handleCreateNewBrand}>
              <Plus className="mr-2 h-5 w-5" />
              Create New Brand
            </Button>
          )}
        </div>
      )}

      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.g style={{ x: panX, y: panY }}>
          <AnimatePresence>
            {cards
              .filter((card) => card.connections)
              .map((card) =>
                card.connections!.map((connId) => {
                  const fromCard = cards.find((c) => c.id === connId);
                  if (!fromCard) return null;

                  const isPitchToAudience =
                    fromCard.type === "elevator-pitch" &&
                    card.type === "audience";

                  const isAudienceToTagline =
                    fromCard.type === "audience" && card.type === "taglines";

                  let x1, y1, x2, y2;

                  if (isPitchToAudience) {
                    x1 = fromCard.position.x + fromCard.width / 2;
                    y1 = fromCard.position.y + fromCard.height;
                    x2 = card.position.x + card.width / 2;
                    y2 = card.position.y;
                  } else if (isAudienceToTagline) {
                    x1 = fromCard.position.x;
                    y1 = fromCard.position.y + fromCard.height / 2;
                    x2 = card.position.x + card.width;
                    y2 = card.position.y + card.height / 2;
                  } else {
                    x1 = fromCard.position.x + fromCard.width;
                    y1 = fromCard.position.y + fromCard.height / 2;
                    x2 = card.position.x;
                    y2 = card.position.y + card.height / 2;
                  }

                  const pathData = isPitchToAudience
                    ? `M ${x1} ${y1} C ${x1} ${
                        y1 + CARD_SPACING / 2
                      }, ${x2} ${y2 - CARD_SPACING / 2}, ${x2} ${y2}`
                    : `M ${x1} ${y1} C ${
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
