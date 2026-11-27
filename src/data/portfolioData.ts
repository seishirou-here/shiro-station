export interface ProjectItem {
  id: string
  trainCode: string
  title: string
  jpTitle: string
  status: 'LIVE' | 'IN PROGRESS' | 'EXPERIMENT'
  summary: string
  tech: string[]
  accent: string
  link?: string
}

export interface BlogDrinkItem {
  id: string
  canLabel: string
  jpLabel: string
  flavorColor: string
  price: string
  date: string
  readTime: string
  title: string
  excerpt: string
  paragraphs: string[]
}

export interface MusicTrack {
  id: string
  title: string
  jpTitle: string
  artist: string
  bpm: number
  vibe: string
  chordProgression: number[][]
}

export const PROFILE_DATA = {
  displayName: 'SHIRO',
  jpName: 'シロ',
  stationName: 'SHIRO STATION',
  stationJp: 'シロ駅',
  role: 'Creative Developer & Builder',
  bio: 'University student and indie builder crafting interactive web experiences, lightweight 3D worlds, and everyday software tools — currently exploring React Three Fiber, TypeScript, and C++ fundamentals.',
  currently: [
    { label: 'BUILDING', value: 'Project Lumos & Shiro Station 3D' },
    { label: 'LEARNING', value: 'C++ Fundamentals & 3D Shaders' },
    { label: 'PLAYING', value: 'Terraria (Drunk World Seed)' },
  ],
  skills: [
    'TypeScript',
    'React',
    'Three.js / R3F',
    'Blender 3D',
    'Tailwind CSS',
    'C++',
    'Node.js',
    'UI/UX Motion',
  ],
  socials: [
    { label: 'GitHub', handle: '@shiro', url: 'https://github.com' },
    { label: 'Portfolio', handle: 'shiro.station', url: '#' },
    { label: 'Email', handle: 'hello@shiro.station', url: 'mailto:hello@shiro.station' },
  ],
  credits:
    'Designed & modeled in Blender + React Three Fiber. Inspired by Japanese railway twilight, Persona UI, and fir4s.com.',
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'lumos',
    trainCode: 'NOZOMI 01',
    title: 'Project Lumos',
    jpTitle: 'プロジェクト・ルモス',
    status: 'IN PROGRESS',
    summary:
      'Personal AI companion & productivity workspace uniting structured planning, daily reflection, and human-in-the-middle coding workflows.',
    tech: ['TypeScript', 'React', 'AI Workflows'],
    accent: '#ffb347',
  },
  {
    id: 'shinkansen-3d',
    trainCode: 'SAKURA 02',
    title: 'Shiro Station 3D',
    jpTitle: 'シロ駅 3Dポートフォリオ',
    status: 'LIVE',
    summary:
      'This interactive Cozy Anime 3D portfolio! Custom Blender N700S 5-car Shinkansen, sakura grove, cutaway interior cars, and diegetic RPG exploration.',
    tech: ['Three.js', 'R3F', 'Blender MCP', 'Zustand'],
    accent: '#ff9cbd',
  },
  {
    id: 'readypath',
    trainCode: 'HIKARI 03',
    title: 'ReadyPath',
    jpTitle: 'レディパス',
    status: 'IN PROGRESS',
    summary:
      'Structured roadmap and career-readiness companion helping students map skills, internships, and scholarship milestones clearly.',
    tech: ['Next.js', 'TypeScript', 'Tailwind'],
    accent: '#7bae7f',
  },
  {
    id: 'cpp-lab',
    trainCode: 'KODAMA 04',
    title: 'C++ Fundamentals Lab',
    jpTitle: 'C++ 基礎ラボ',
    status: 'EXPERIMENT',
    summary:
      'Hands-on algorithms, memory-model exercises, and small CLI experiments built while mastering core C++ concepts from the ground up.',
    tech: ['C++', 'Algorithms', 'CLI'],
    accent: '#e08b67',
  },
]

export const BLOGS_DATA: BlogDrinkItem[] = [
  {
    id: 'devlog-n700s',
    canLabel: 'SAKURA SODA',
    jpLabel: '桜ソーダ',
    flavorColor: '#ff9cbd',
    price: '¥140',
    date: '2026-11-26',
    readTime: '3 min read',
    title: 'Modeling a Lightweight 5-Car N700S Shinkansen for Mobile Web',
    excerpt:
      'How we kept a 5-car bullet train, cutaway lounge interiors, and 3 sakura trees under 1.2 MB using procedural Blender sculpting and clean glTF exports.',
    paragraphs: [
      'Most 3D portfolio websites struggle on mobile because raw sculpted meshes ship tens of megabytes of textures and dense geometry. For Shiro Station, the goal was the opposite: authentic Cozy Anime silhouette with mobile-first speed.',
      'By lofting the N700S Dual Supreme Wing nose from 24 clean cross-sections and sharing wheel geometry across bogies, the entire 5-car bullet train came out to just ~326 KB in GLB format — complete with sliding doors and cutaway roofs.',
      'Combining a 3D low-poly station with live interactive surfaces (like the glowing signboard clock and corkboard notes) gives real depth and shadows without blowing up polygon counts.',
    ],
  },
  {
    id: 'why-diegetic-ui',
    canLabel: 'MATCHA LATTE',
    jpLabel: '抹茶ラテ',
    flavorColor: '#7bae7f',
    price: '¥160',
    date: '2026-11-24',
    readTime: '2 min read',
    title: 'Why Clicking a Train Beats a Top Navbar',
    excerpt:
      'Turning portfolio sections into physical landmarks — vending machines for blogs, train cars for projects, and the driver cab for an anime-ending profile.',
    paragraphs: [
      'Traditional navbars tell visitors what to read; game worlds invite visitors to explore. Inspired by Persona HUDs and creative spaces like fir4s.com, Shiro Station maps every portfolio section to a tangible object.',
      'Instead of blocking the arrival with a modal popup, the hanging SHIRO STATION signboard immediately establishes whose world you just stepped into.',
      'From there, grabbing a drink from the vending machine opens devlogs, pinning a sticky note signs the guestbook, and stepping aboard the N700S takes you through projects, lounge music, and the final driver cab profile.',
    ],
  },
  {
    id: 'cpp-notes',
    canLabel: 'YUZU CITRUS',
    jpLabel: 'ゆずサイダー',
    flavorColor: '#ffb347',
    price: '¥130',
    date: '2026-11-20',
    readTime: '3 min read',
    title: 'Notes From Learning C++ Fundamentals',
    excerpt:
      'Mental models that made pointers, references, and value semantics finally click after coming from JavaScript and TypeScript.',
    paragraphs: [
      'Moving from TypeScript to C++ feels like switching from automatic transmission to manual — suddenly you see every allocation, stack frame, and reference lifetime.',
      'Understanding the difference between passing by value, passing by const reference, and owning a resource via RAII changed how I think about performance even back in JavaScript and WebGL.',
      'Small daily experiments beat passive reading every time — writing clean, tiny programs builds real intuition fast.',
    ],
  },
]

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'sakura-dusk',
    title: 'Golden Hour at Shiro Platform',
    jpTitle: 'シロ駅の夕暮れ',
    artist: 'Shiro Synth Deck',
    bpm: 78,
    vibe: 'Warm Rhodes Lo-Fi',
    chordProgression: [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
    ],
  },
  {
    id: 'tokaido-breeze',
    title: 'N700S Twilight Cruise',
    jpTitle: 'のぞみ黄昏クルーズ',
    artist: 'Shiro Synth Deck',
    bpm: 88,
    vibe: 'City-Pop Chime',
    chordProgression: [
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 349.23, 440.0],  // G9
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 277.18, 329.63, 392.0],  // A7
    ],
  },
  {
    id: 'midnight-velvet',
    title: 'Sakura Express Lounge',
    jpTitle: '桜ラウンジ深夜便',
    artist: 'Shiro Synth Deck',
    bpm: 72,
    vibe: 'Cozy Jazz Bell',
    chordProgression: [
      [233.08, 293.66, 349.23, 440.0], // Bbmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [196.0, 233.08, 293.66, 349.23], // Gm7
      [261.63, 329.63, 392.0, 466.16], // C7
    ],
  },
]
