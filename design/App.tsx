import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  MapPin,
  Share2,
  X,
  Users,
} from "lucide-react";
import Masonry from "react-masonry-css";
import copy from "copy-to-clipboard";

import { apiClient, inferRPCInputType, inferRPCOutputType } from "~/client/api";
import { getBaseUrl, encodeFileAsBase64DataURL, useAuth } from "~/client/utils";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Badge,
  ScrollArea,
  ScrollBar,
  Skeleton,
} from "~/components/ui";

type Memory = inferRPCOutputType<"listMemories">[number];
type CreateMemoryInput = inferRPCInputType<"createMemory">;
type CreateRsvpInput = inferRPCInputType<"createRsvp">;
type AdminStatus = inferRPCOutputType<"getAdminStatus">;
type Rsvp = inferRPCOutputType<"listRsvps">[number];
type DashboardStats = inferRPCOutputType<"getDashboardStats">;

const queryClient = new QueryClient();

// ----- Static content derived from reference -----

const HERO_DATA = {
  name: "Oscar Robinson",
  birth: "March 30, 1980",
  death: "May 24, 2025",
  location: "Charlotte, North Carolina",
  quote:
    "Death leaves a heartache no one can heal, love leaves a memory no one can steal.",
  photoUrl: "https://www.online-tribute.com/memorial/static/random2.jpg",
};

const OBITUARY_TEXT = `Oscar Robinson, a beloved husband, father, and dedicated community member, peacefully passed away on March 25, 2023 at the age of 73.

Born on March 10, 1950, Oscar grew up with strong family values and a deep sense of community. He excelled academically and athletically in high school, eventually earning a Bachelor's degree in Business Administration.

In 1975, Oscar married his love, Shannon, and they shared 48 years of a loving marriage, raising two children, Emily and Michael, and becoming adoring grandparents to Grace, Ethan, and Lily.

Professionally, Oscar had a distinguished career in finance, marked by his integrity and mentorship of young professionals. He also dedicated his time to various charitable causes, leaving a positive impact on his community.

Oscar had a passion for the outdoors, often spending weekends camping, fishing, and hiking with his family, instilling a love for nature in his loved ones.

Oscar is survived by his wife, children, grandchildren, and siblings, Robert Jr. and Susan. A memorial service will be held on October 2, 2023, at St. Mary's Community Church at 2:00 PM.

In lieu of flowers, the family requests donations to the Oscar Robinson Memorial Scholarship Fund, supporting underprivileged youth's education in the community. Oscar's legacy lives on through the countless lives he touched, the values he upheld, and the love he shared. He will be deeply missed but forever cherished.`;

const FAVORITES = [
  {
    question: "What was Oscar's favorite saying?",
    answer: `"Live and let live" · "You're never too old to learn"`,
  },
  {
    question: "What was Oscar's favorite book?",
    answer: "To Kill a Mockingbird by Harper Lee — a timeless classic.",
  },
  {
    question: "What was Oscar's favorite movie?",
    answer: "Forrest Gump, The Godfather.",
  },
  {
    question: "What was Oscar's favorite travel destination?",
    answer: "Italy — especially Florence and Tuscany.",
  },
  {
    question: "What was Oscar's favorite color?",
    answer: "Pale green, pale blue… anything pale or pastel.",
  },
  {
    question: "Fun fact about Oscar:",
    answer: "Oscar was great at juggling 🤹",
  },
];

type TimelineItem = {
  year: string;
  date: string;
  title: string;
  location?: string;
  description?: string;
};

const TIMELINE: TimelineItem[] = [
  {
    year: "1973",
    date: "March 16",
    title: "Birth in San Jose",
    location: "San Jose, California",
  },
  {
    year: "1982",
    date: "July 1",
    title: "Graduated from university",
    location: "University of California, Los Angeles",
  },
  {
    year: "1984",
    date: "February 14",
    title: "Met Shannon",
    description:
      "Shannon and Oscar met at a school reunion organized by a mutual friend.",
  },
  {
    year: "1989",
    date: "June 9",
    title: "Wedding",
    location: "California",
    description:
      "Shannon and Oscar married in a beautiful yet intimate ceremony.",
  },
  {
    year: "1992",
    date: "October 18",
    title: "Birth of Emily",
    description: "Birth of Emily, their first child.",
  },
  {
    year: "1995",
    date: "August 6",
    title: "Birth of Michael",
    description: "Birth of Michael, their second child.",
  },
  {
    year: "2012",
    date: "December 12",
    title: "Became a grandparent",
    description:
      "Oscar became a grandparent for the first time — welcome to little Lilly!",
  },
  {
    year: "2023",
    date: "August 10",
    title: "Passed away peacefully",
    location: "San Jose, California",
  },
];

type GalleryCategoryKey = "all" | "portraits" | "family" | "couple";

type GalleryImage = {
  id: string;
  url: string;
  category: GalleryCategoryKey;
  label?: string;
  description?: string;
};

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "g1",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913796.jpg",
    category: "couple",
  },
  {
    id: "g2",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913804.jpg",
    category: "couple",
    description: "Oscar and his spouse Shannon.",
  },
  {
    id: "g3",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913812.jpg",
    category: "portraits",
  },
  {
    id: "g4",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913820.jpg",
    category: "couple",
    description: "What a loving couple they were.",
  },
  {
    id: "g5",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913826.jpg",
    category: "family",
    description: "Exercising together at the family country house.",
  },
  {
    id: "g6",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913831.jpg",
    category: "family",
  },
  {
    id: "g7",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913837.jpg",
    category: "couple",
  },
  {
    id: "g8",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913874.jpg",
    category: "family",
  },
  {
    id: "g9",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695913880.jpg",
    category: "portraits",
  },
  {
    id: "g10",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695914616.jpg",
    category: "family",
  },
  {
    id: "g11",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695914632.jpg",
    category: "couple",
    description: "Oscar and Shannon were always so chic.",
  },
  {
    id: "g12",
    url: "https://www.online-tribute.com/memorial/uploads/gallery/min/page-0-7-1695914663.jpg",
    category: "family",
    description: "With their granddaughter — summer 2021.",
  },
];

const FAMILY_TREE = {
  grandparents: [
    {
      name: "John Richardson",
      role: "grandparent",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696518264.jpg",
    },
    {
      name: "Jacqueline Richardson",
      role: "grandparent",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696518272.jpg",
    },
    {
      name: "Bradley Clarkson",
      role: "grandparent",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696518278.jpg",
    },
    {
      name: "Emma Marie Clarkson",
      role: "grandparent",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696518285.jpg",
    },
  ],
  parents: [
    {
      name: "Paul Richardson",
      role: "parent",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696518291.jpg",
    },
    {
      name: "Margaret Clarkson",
      role: "parent",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696518299.jpg",
    },
  ],
  deceased: {
    name: "Oscar Robinson",
    role: "self",
    photo: HERO_DATA.photoUrl,
  },
  spouse: {
    name: "Joanne Richardson",
    role: "spouse",
    photo: "https://www.online-tribute.com/memorial/static/tree-default.png",
  },
  siblings: [
    {
      name: "Robert Richardson",
      role: "sibling",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696520370.jpg",
    },
    {
      name: "Susan Jones",
      role: "sibling",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696518892.jpg",
    },
  ],
  children: [
    {
      name: "Michael Richardson",
      role: "child",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696519180.jpg",
    },
    {
      name: "Emily Richardson",
      role: "child",
      photo:
        "https://www.online-tribute.com/memorial/uploads/tree/page-0-7-1696518909.jpg",
    },
  ],
};

const SERVICE = {
  description:
    "Please join us to pay a last tribute. We invite you to gather in celebration of Oscar's remarkable life — to remember, to share stories, and to support one another.",
  locationLines: [
    "San Jose Funeral Home",
    "1050 S. Bascom Ave",
    "San Jose, California 95128",
  ],
  dateTime: "June 26, 2023 · 2:00 PM",
  virtualUrl: "https://www.zoom.com",
};

// ----- Shared utilities -----

function formatDateTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type LightboxItem = {
  url: string;
  caption?: string;
  author?: string;
};

type LightboxState = {
  open: boolean;
  items: LightboxItem[];
  index: number;
};

function useLightbox() {
  const [state, setState] = useState<LightboxState>({
    open: false,
    items: [],
    index: 0,
  });

  const open = useCallback((items: LightboxItem[], index: number) => {
    if (!items.length) return;
    setState({ open: true, items, index });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      if (!prev.items.length) return prev;
      return {
        ...prev,
        index: (prev.index + 1) % prev.items.length,
      };
    });
  }, []);

  const prev = useCallback(() => {
    setState((prev) => {
      if (!prev.items.length) return prev;
      return {
        ...prev,
        index: (prev.index - 1 + prev.items.length) % prev.items.length,
      };
    });
  }, []);

  return { state, open, close, next, prev };
}

// ----- Section navigation -----

const SECTION_IDS = [
  "obituary",
  "favorites",
  "timeline",
  "gallery",
  "memory-wall",
  "family-tree",
  "service",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

function SectionNav({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  const items: { id: SectionId; label: string }[] = [
    { id: "obituary", label: "Obituary" },
    { id: "favorites", label: "Favorites" },
    { id: "timeline", label: "Timeline" },
    { id: "gallery", label: "Gallery" },
    { id: "memory-wall", label: "Memory wall" },
    { id: "family-tree", label: "Family tree" },
    { id: "service", label: "Service" },
  ];

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 px-4 py-2 ever-no-scrollbar">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={item.id === active ? "default" : "ghost"}
            size="sm"
            className="whitespace-nowrap"
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

// ----- Memory wall -----

function MemoryWall({
  lightboxOpen,
}: {
  lightboxOpen: (items: LightboxItem[], index: number) => void;
}) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: memories, isInitialLoading } = useQuery(
    ["memories"],
    apiClient.listMemories,
  );

  const likeMutation = useMutation(apiClient.likeMemory, {
    onMutate: async ({ id }) => {
      setError(null);
      await queryClient.cancelQueries(["memories"]);
      const prev = queryClient.getQueryData<Memory[]>(["memories"]);
      if (prev) {
        queryClient.setQueryData<Memory[]>(
          ["memories"],
          prev.map((m) =>
            m.id === id ? { ...m, likeCount: (m.likeCount ?? 0) + 1 } : m,
          ),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["memories"], ctx.prev);
      }
      setError("We couldn't register your like. Please try again later.");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["memories"]).catch(() => undefined);
    },
  });

  return (
    <section className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Memory wall</h2>
          <p className="ever-prose-muted mt-1 max-w-2xl">
            “To live in the hearts we leave behind is not to die.” Please share
            your photos and memories about Oscar.
          </p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
        >
          Contribute
        </Button>
      </div>

      <AddMemoryModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isInitialLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !memories || memories.length === 0 ? (
        <p className="ever-prose-muted">
          No memories have been shared yet. Be the first to add one.
        </p>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <Card key={memory.id}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{formatDateTime(memory.createdAt)}</span>
                  <button
                    type="button"
                    disabled={likeMutation.isLoading}
                    onClick={() => likeMutation.mutate({ id: memory.id })}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Heart className="h-3 w-3" />
                    <span>
                      {memory.likeCount && memory.likeCount > 0
                        ? memory.likeCount
                        : "Like"}
                    </span>
                  </button>
                </div>
                <p className="ever-prose whitespace-pre-wrap">
                  {memory.message}
                </p>
                {memory.photoUrl && (
                  <div className="mt-2">
                    <img
                      src={memory.photoUrl}
                      alt={`Memory shared by ${memory.name}`}
                      className="max-h-80 w-full rounded-md object-cover cursor-pointer"
                      onClick={() =>
                        lightboxOpen(
                          [
                            {
                              url: memory.photoUrl!,
                              caption: memory.message,
                              author: memory.name,
                            },
                          ],
                          0,
                        )
                      }
                    />
                  </div>
                )}
                <div className="text-sm font-medium text-muted-foreground">
                  {memory.name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function AddMemoryModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<{
    name: string;
    email: string;
    message: string;
    file?: File;
  }>({
    name: "",
    email: "",
    message: "",
    file: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  const createMemoryMutation = useMutation(apiClient.createMemory, {
    onMutate: async (newMemory) => {
      setError(null);
      await queryClient.cancelQueries(["memories"]);
      const previous = queryClient.getQueryData<Memory[]>(["memories"]);
      queryClient.setQueryData<Memory[]>(["memories"], (old) => [
        {
          id: `temp-${Date.now()}`,
          createdAt: new Date(),
          likeCount: 0,
          name: newMemory.name,
          message: newMemory.message,
          email: newMemory.email ?? null,
          photoUrl: null,
        } as Memory,
        ...(old ?? []),
      ]);
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["memories"], ctx.previous);
      }
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    },
    onSuccess: () => {
      setForm({
        name: "",
        email: "",
        message: "",
        file: undefined,
      });
      onOpenChange(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["memories"]).catch(() => undefined);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createMemoryMutation.isLoading) return;

    if (!form.name.trim() || !form.message.trim()) {
      setError("Please add your name and a short memory.");
      return;
    }

    let photoBase64: string | undefined;

    if (form.file) {
      const MAX_MB = 10;
      if (form.file.size > MAX_MB * 1024 * 1024) {
        setError(`Photo is too large. Please choose a file under ${MAX_MB}MB.`);
        return;
      }
      const base64 = await encodeFileAsBase64DataURL(form.file);
      if (!base64) {
        setError(
          "We couldn't read that photo on this device. Please try a different image.",
        );
        return;
      }
      photoBase64 = base64;
    }

    const payload: CreateMemoryInput = {
      name: form.name,
      message: form.message,
      email: form.email || undefined,
      photoBase64,
    };

    createMemoryMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share a memory</DialogTitle>
          <DialogDescription>
            Your message will appear on the Memory wall for friends and family
            to read.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="memory-name">Name</Label>
            <Input
              id="memory-name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-email">Email (optional)</Label>
            <Input
              id="memory-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="we’ll never show this publicly"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-message">Message</Label>
            <Textarea
              id="memory-message"
              rows={4}
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              placeholder="Share a story, a moment, or what Oscar meant to you…"
            />
          </div>
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  file: e.target.files?.[0],
                }))
              }
            />
            {form.file && (
              <p className="text-xs text-muted-foreground">
                Selected: {form.file.name}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={createMemoryMutation.isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMemoryMutation.isLoading}>
              {createMemoryMutation.isLoading ? "Sharing…" : "Share memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ----- RSVP modal -----

function RsvpModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    attending: "yes" | "no";
    email: string;
    phone: string;
    note: string;
  }>({
    firstName: "",
    lastName: "",
    attending: "yes",
    email: "",
    phone: "",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const rsvpMutation = useMutation(apiClient.createRsvp, {
    onMutate: () => {
      setError(null);
      setSuccess(false);
    },
    onError: (err) => {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    },
    onSuccess: () => {
      setSuccess(true);
      setForm({
        firstName: "",
        lastName: "",
        attending: "yes",
        email: "",
        phone: "",
        note: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rsvpMutation.isLoading) return;

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please add your first and last name.");
      return;
    }

    const payload: CreateRsvpInput = {
      firstName: form.firstName,
      lastName: form.lastName,
      attending: form.attending === "yes",
      email: form.email || undefined,
      phone: form.phone || undefined,
      note: form.note || undefined,
    };

    rsvpMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>RSVP to the service</DialogTitle>
          <DialogDescription>
            Let the family know whether you plan to attend.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rsvp-first">First name</Label>
              <Input
                id="rsvp-first"
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rsvp-last">Last name</Label>
              <Input
                id="rsvp-last"
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Attendance</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.attending === "yes" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    attending: "yes",
                  }))
                }
              >
                Attending
              </Button>
              <Button
                type="button"
                variant={form.attending === "no" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    attending: "no",
                  }))
                }
              >
                Not attending
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rsvp-email">Email (optional)</Label>
              <Input
                id="rsvp-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rsvp-phone">Phone (optional)</Label>
              <Input
                id="rsvp-phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-note">Note to the family (optional)</Label>
            <Textarea
              id="rsvp-note"
              rows={3}
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600">
              Thank you — your RSVP has been recorded.
            </p>
          )}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={rsvpMutation.isLoading}
            >
              Close
            </Button>
            <Button type="submit" disabled={rsvpMutation.isLoading}>
              {rsvpMutation.isLoading ? "Submitting…" : "Submit RSVP"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ----- Gallery -----

function GallerySection({
  lightboxOpen,
}: {
  lightboxOpen: (items: LightboxItem[], index: number) => void;
}) {
  const [filter, setFilter] = useState<GalleryCategoryKey>("all");

  const filteredImages = useMemo(() => {
    if (filter === "all") return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter((img) => img.category === filter);
  }, [filter]);

  const lightboxItems: LightboxItem[] = filteredImages.map((img) => ({
    url: img.url,
    caption: img.description,
  }));

  const categoryLabel: Record<GalleryCategoryKey, string> = {
    all: "All",
    portraits: "Portraits",
    family: "Family activities",
    couple: "Loving couple",
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <section className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Gallery</h2>
        <Button
          variant="outline"
          size="sm"
          disabled={!filteredImages.length}
          onClick={() => lightboxOpen(lightboxItems, 0)}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Slideshow
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", "portraits", "family", "couple"] as const).map((key) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {categoryLabel[key]}
          </Button>
        ))}
      </div>
      {filteredImages.length === 0 ? (
        <p className="ever-prose-muted">
          There are no images in this filter yet.
        </p>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-4"
          columnClassName="space-y-4"
        >
          {filteredImages.map((img, index) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-lg border bg-card"
            >
              <img
                src={img.url}
                alt={img.description || "Gallery image"}
                className="h-full w-full cursor-pointer object-cover transition-transform duration-200 hover:scale-[1.02]"
                onClick={() => lightboxOpen(lightboxItems, index)}
              />
              {img.description && (
                <div className="p-2 text-xs text-muted-foreground">
                  {img.description}
                </div>
              )}
            </div>
          ))}
        </Masonry>
      )}
    </section>
  );
}

// ----- Family tree -----

function FamilyTreeSection() {
  return (
    <section className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Family tree</h2>
      <Card className="bg-card/70">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <FamilyRow
              title="Grandparents"
              members={FAMILY_TREE.grandparents}
            />
            <div className="grid gap-6 md:grid-cols-[2fr,3fr,2fr] items-center">
              <FamilyRow title="Parents" members={FAMILY_TREE.parents} />
              <div className="flex flex-col items-center gap-2">
                <FamilyAvatar member={FAMILY_TREE.deceased} />
                <div className="h-px w-10 bg-border" />
                <FamilyAvatar member={FAMILY_TREE.spouse} />
              </div>
              <FamilyRow title="Siblings" members={FAMILY_TREE.siblings} />
            </div>
            <FamilyRow title="Children" members={FAMILY_TREE.children} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function FamilyRow({
  title,
  members,
}: {
  title: string;
  members: { name: string; role: string; photo: string }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground text-center">
        {title}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {members.map((m) => (
          <FamilyAvatar key={m.name} member={m} />
        ))}
      </div>
    </div>
  );
}

function FamilyAvatar({
  member,
}: {
  member: { name: string; role: string; photo: string };
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
        <img
          src={member.photo}
          alt={member.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{member.name}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {member.role}
        </p>
      </div>
    </div>
  );
}

// ----- Service section -----

function ServiceSection({ onOpenRsvp }: { onOpenRsvp: () => void }) {
  return (
    <section className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Service</h2>
      <Card>
        <CardContent className="grid gap-6 pt-6 md:grid-cols-[2fr,1.5fr]">
          <div className="space-y-3">
            <p className="ever-prose whitespace-pre-wrap">
              {SERVICE.description}
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Location
              </div>
              <p className="ever-prose">
                {SERVICE.locationLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Date / time
              </div>
              <p className="ever-prose">{SERVICE.dateTime}</p>
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Users className="h-3 w-3" />
                Virtual
              </div>
              <a
                href={SERVICE.virtualUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline underline-offset-4"
              >
                Join via Zoom
              </a>
            </div>
            <div className="pt-2">
              <Button className="w-full sm:w-auto" onClick={onOpenRsvp}>
                RSVP
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// ----- Image lightbox -----

function ImageLightbox({
  state,
  close,
  next,
  prev,
}: {
  state: LightboxState;
  close: () => void;
  next: () => void;
  prev: () => void;
}) {
  if (!state.open || !state.items.length) return null;
  const current = state.items[state.index]!;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
      <button
        type="button"
        className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white"
        onClick={close}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
        onClick={prev}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
        onClick={next}
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="mx-4 flex max-h-[90vh] max-w-4xl flex-col items-center gap-4">
        <img
          src={current.url}
          alt={current.caption || "Photo"}
          className="max-h-[70vh] w-auto rounded-lg object-contain"
        />
        {(current.caption || current.author) && (
          <div className="max-w-xl text-center text-sm text-muted-foreground">
            {current.caption && (
              <p className="mb-1 whitespace-pre-wrap">{current.caption}</p>
            )}
            {current.author && (
              <p className="font-medium">— {current.author}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ----- Share button -----

function FloatingShareButton() {
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const shareUrl = useMemo(() => {
    const base = getBaseUrl();
    return new URL(location.pathname, base).toString();
  }, [location.pathname]);

  const handleShare = async () => {
    setCopied(false);
    if (
      typeof navigator !== "undefined" &&
      (
        navigator as Navigator & {
          share?: (data: { url: string }) => Promise<void>;
        }
      ).share
    ) {
      try {
        await (
          navigator as Navigator & {
            share?: (data: { url: string }) => Promise<void>;
          }
        ).share({
          url: shareUrl,
        });
        return;
      } catch {
        // fall through to copy
      }
    }
    copy(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="fixed bottom-5 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <Share2 className="h-4 w-4" />
      {copied ? "Copied link" : "Share"}
    </button>
  );
}

// ----- Main memorial screen -----

function MemorialScreen() {
  const [activeSection, setActiveSection] = useState<SectionId>("obituary");
  const lightbox = useLightbox();
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  const sectionRefs = useMemo(
    () =>
      SECTION_IDS.reduce(
        (acc, id) => ({
          ...acc,
          [id]: React.createRef<HTMLDivElement>(),
        }),
        {} as Record<SectionId, React.RefObject<HTMLDivElement>>,
      ),
    [],
  );

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = heroRef.current;
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      setShowStickyHeader(rect.bottom <= 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [heroRef]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0),
          );
        if (visible[0]) {
          const id = visible[0].target.id as SectionId;
          if (SECTION_IDS.includes(id)) {
            setActiveSection(id);
          }
        }
      },
      { threshold: 0.4 },
    );

    SECTION_IDS.forEach((id) => {
      const el = sectionRefs[id].current || document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionRefs]);

  const scrollToSection = (id: SectionId) => {
    const el = sectionRefs[id].current || document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header ref={heroRef} className="ever-hero-bg border-b">
        <div className="bg-[hsl(var(--ever-hero-overlay))]">
          <div className="mx-auto flex min-h-[100vh] max-w-4xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground/80">
              In loving memory of
            </p>
            <div className="h-52 w-52 overflow-hidden rounded-2xl border bg-muted shadow-sm md:h-64 md:w-64">
              <img
                src={HERO_DATA.photoUrl}
                alt={HERO_DATA.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <div className="mt-2">
                <h1 className="text-4xl font-semibold tracking-tight md:text-[2.9rem]">
                  {HERO_DATA.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground md:text-base">
                  <span>
                    {HERO_DATA.birth} — {HERO_DATA.death}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {HERO_DATA.location}
                  </span>
                </div>
              </div>
              <p className="ever-prose-muted mx-auto max-w-2xl text-sm italic md:text-base">
                {HERO_DATA.quote}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div
          className={`mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 transition-all duration-300 ${
            showStickyHeader
              ? "pointer-events-auto py-2 opacity-100"
              : "pointer-events-none py-0 opacity-0 -translate-y-2"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl border bg-muted">
              <img
                src={HERO_DATA.photoUrl}
                alt={HERO_DATA.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 text-left">
              <div className="truncate text-sm font-semibold md:text-base">
                {HERO_DATA.name}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground md:text-xs">
                <span>
                  {HERO_DATA.birth}  {HERO_DATA.death}
                </span>
                <span>e</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {HERO_DATA.location}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-background/95">
          <SectionNav active={activeSection} onSelect={scrollToSection} />
        </div>
      </div>

      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-8 pb-24">
        {/* Obituary */}
        <section
          id="obituary"
          ref={sectionRefs["obituary"]}
          className="scroll-mt-24 space-y-4"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Obituary</h2>
          <p className="ever-prose whitespace-pre-wrap">{OBITUARY_TEXT}</p>
        </section>

        {/* Favorites */}
        <section
          id="favorites"
          ref={sectionRefs["favorites"]}
          className="scroll-mt-24 space-y-4"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Favorites</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {FAVORITES.map((fav) => (
              <Card key={fav.question}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {fav.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="ever-prose">{fav.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section
          id="timeline"
          ref={sectionRefs["timeline"]}
          className="scroll-mt-24 space-y-4"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Timeline</h2>
          <div className="relative border-l pl-4">
            {TIMELINE.map((item, idx) => (
              <div
                key={`${item.year}-${item.title}`}
                className="mb-6 last:mb-0"
              >
                <div className="absolute -left-[9px] mt-1 h-3 w-3 rounded-full border border-background bg-primary" />
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.year}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.date}
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium">{item.title}</div>
                {item.location && (
                  <div className="text-xs text-muted-foreground">
                    {item.location}
                  </div>
                )}
                {item.description && (
                  <p className="ever-prose mt-1 text-sm">{item.description}</p>
                )}
                {idx !== TIMELINE.length - 1 && (
                  <div className="mt-4 h-px w-10 bg-border" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <div id="gallery" ref={sectionRefs["gallery"]}>
          <GallerySection lightboxOpen={lightbox.open} />
        </div>

        {/* Memory wall */}
        <div id="memory-wall" ref={sectionRefs["memory-wall"]}>
          <MemoryWall lightboxOpen={lightbox.open} />
        </div>

        {/* Family tree */}
        <div id="family-tree" ref={sectionRefs["family-tree"]}>
          <FamilyTreeSection />
        </div>

        {/* Service */}
        <div id="service" ref={sectionRefs["service"]}>
          <ServiceSection onOpenRsvp={() => setIsRsvpOpen(true)} />
        </div>

        <RsvpModal open={isRsvpOpen} onOpenChange={setIsRsvpOpen} />
      </main>

      <ImageLightbox
        state={lightbox.state}
        close={lightbox.close}
        next={lightbox.next}
        prev={lightbox.prev}
      />

      <FloatingShareButton />
    </div>
  );
}

// ----- Admin dashboard -----

function AdminDashboard() {
  const auth = useAuth();
  const { data: adminStatus } = useQuery<AdminStatus>(
    ["admin-status"],
    apiClient.getAdminStatus,
  );

  const isAdmin = !!adminStatus?.isAdmin;

  const { data: stats } = useQuery<DashboardStats>(
    ["dashboard-stats"],
    apiClient.getDashboardStats,
    { enabled: isAdmin },
  );

  const { data: rsvps } = useQuery<Rsvp[]>(
    ["admin-rsvps"],
    apiClient.listRsvps,
    { enabled: isAdmin },
  );

  if (!adminStatus?.authenticated) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin dashboard
        </h1>
        <p className="ever-prose-muted">
          This area is for the memorial host. Sign in to manage RSVPs and see
          engagement.
        </p>
        <div>
          <Button onClick={() => auth.signIn({ provider: "AC1" })}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin dashboard
        </h1>
        <p className="ever-prose-muted mt-2">
          Your account is not marked as an admin for this memorial. If you are
          the host, please contact the person who set up this page to grant you
          access.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin dashboard
          </h1>
          <p className="ever-prose-muted mt-1 text-sm">
            A private view for the host to see RSVPs and engagement.
          </p>
        </div>
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to memorial
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total memories
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 text-2xl font-semibold">
            {stats?.memoryCount ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total RSVPs
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 text-2xl font-semibold">
            {stats?.rsvpCount ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 text-sm">
            <p className="font-medium">{auth.userId || "Unknown user"}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">RSVPs</h2>
          <Badge variant="secondary">{rsvps?.length ?? 0} total</Badge>
        </div>
        {!rsvps || rsvps.length === 0 ? (
          <p className="ever-prose-muted text-sm">No RSVPs yet.</p>
        ) : (
          <div className="space-y-3">
            {rsvps.map((rsvp) => (
              <Card key={rsvp.id}>
                <CardContent className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {rsvp.firstName} {rsvp.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {rsvp.attending ? "Attending" : "Not attending"} ·{" "}
                      {formatDateTime(rsvp.createdAt)}
                    </div>
                    {rsvp.note && (
                      <p className="ever-prose-muted mt-1 text-xs">
                        {rsvp.note}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 sm:text-right">
                    {rsvp.email && <div>{rsvp.email}</div>}
                    {rsvp.phone && <div>{rsvp.phone}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ----- Layout / App shell -----

function AppShell() {
  const { data: adminStatus } = useQuery<AdminStatus>(
    ["admin-status"],
    apiClient.getAdminStatus,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-base font-semibold tracking-tight">
            EverRemember
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {adminStatus?.isAdmin && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  Admin
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<MemorialScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppShell />
      </Router>
    </QueryClientProvider>
  );
}
