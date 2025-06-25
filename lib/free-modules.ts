export const freeModules = [
  {
    id: 'intro-to-phishing',
    title: 'Phishing Awareness',
    description: 'Master the art of identifying and defending against phishing scams.',
    imageUrl: 'https://res.cloudinary.com/placeholder/phishing.png',
    content: `Phishing is one of the oldest and most dangerous forms of cyberattack—and it's only getting smarter. This module delves into advanced phishing techniques like spear phishing (targeted attacks using personal info), whaling (executive-level impersonation), and business email compromise (BEC). You'll also learn how attackers bypass spam filters, craft emotionally manipulative messages, and exploit real-world events (like disasters or elections) to increase success rates. More than just spotting suspicious links, this module teaches deep analysis of headers, URL redirection chains, and identifying pixel-tracking methods used in modern phishing campaigns. Learn to think like an attacker so you can defend like a pro.`
  },
  {
    id: 'password-security-advanced',
    title: 'Password Security',
    description: 'Go beyond basics—fortify your digital identity like a cybersecurity professional.',
    imageUrl: 'https://res.cloudinary.com/placeholder/password.png',
    content: `Your password is not just a key—it's your entire digital identity. This module reveals why traditional advice like "use a capital letter and a number" no longer cuts it. Learn about **entropy theory**, password cracking techniques using **hashcat** and **rainbow tables**, and how **dictionary attacks** exploit human psychology. Explore real breaches to understand how even encrypted passwords get exposed, and why **passphrases** and **passwordless authentication** are the future. You'll also learn how to detect if your credentials have been compromised using dark web scanning and tools like HaveIBeenPwned. Finally, we’ll walk through setting up and using hardware keys (like YubiKey) for unbreakable 2FA.`
  },
  {
    id: 'malware-protection',
    title: 'Malware Protection',
    description: 'Understand how malware works—and how to stop it before it strikes.',
    imageUrl: 'https://res.cloudinary.com/placeholder/malware.png',
    content: `Malware is more than just viruses—it's a suite of tools attackers use to control, spy, steal, or destroy. In this module, you'll explore **trojans, worms, ransomware, rootkits, fileless malware**, and even **zero-day threats**. Go under the hood to see how malware hides in memory, evades antivirus engines using **polymorphic code**, and uses **command and control (C2) beacons** to report home. You'll learn about sandbox evasion techniques, how to detect unusual system behavior, and why **air-gapped malware** (like Stuxnet) changed history. We’ll also cover essential defense strategies like behavior-based detection, EDR tools, system hardening, and how to create your own personal incident response plan.`
  },
  {
    id: 'safe-browsing',
    title: 'Safe Browsing',
    description: 'Turn your web browser into a fortress of security and privacy.',
    imageUrl: 'https://res.cloudinary.com/placeholder/browsing.png',
    content: `Web browsing is a minefield of privacy and security risks. This module arms you with knowledge to avoid being tracked, manipulated, or exploited. You’ll learn how **man-in-the-middle (MitM)** attacks intercept your data over public Wi-Fi, and how DNS spoofing can reroute you to fake sites. Understand the difference between **HTTPS, HSTS,** and **SSL stripping**. Learn about **browser fingerprinting**, tracking pixels, and why private browsing isn’t truly private. You’ll explore tools like **uBlock Origin**, **NoScript**, **privacy-oriented DNS resolvers**, and **isolation-based browsing** (like Firefox containers). Learn to audit browser extensions and identify potential risks hiding in plain sight.`
  },
  {
    id: 'data-protection',
    title: 'Data Protection',
    description: 'Control who accesses your data—and how.',
    imageUrl: 'https://res.cloudinary.com/placeholder/data.png',
    content: `Data is power—and your data is a target. This module teaches you how to safeguard data at rest, in transit, and in use. Learn about **AES-256 encryption**, **public key infrastructure (PKI)**, and **zero-knowledge architecture** used by top-tier cloud services. Understand what makes certain metadata more dangerous than the files themselves, and how to scrub it before sharing documents or images. Explore **data minimization**, **data sovereignty laws**, and the dangers of third-party app permissions. You'll also gain practical strategies for securely backing up data using **offsite cold storage**, versioning, and secure delete protocols (like DoD 5220.22-M wiping).`
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering',
    description: 'Understand how hackers exploit human psychology—and how to fight back.',
    imageUrl: 'https://res.cloudinary.com/placeholder/social.png',
    content: `Social engineering isn’t just "tricking people." It’s a psychological operation designed to bypass even the best technology. This module explores **pretexting**, **tailgating**, **vishing (voice phishing)**, and the science behind **compliance triggers** like authority, scarcity, and urgency. You'll learn how attackers use OSINT (Open Source Intelligence) to customize their attacks—from what you tweet to your office floorplan. Dive into case studies like the Twitter admin panel breach and the 2020 MGM data leak to see social engineering in action. Plus, you'll learn how to conduct a **social engineering risk audit** in your own organization or personal workflow.`
  },
  {
    id: 'certification-program',
    title: 'Certification Program',
    description: 'Get certified in cybersecurity fundamentals.',
    imageUrl: 'https://res.cloudinary.com/placeholder/certification.png',
    content: `Show the world you're cyber-aware. After completing all modules, you’ll unlock access to our **CyberAware Certified User exam**. This assessment is scenario-based, testing not just memory, but decision-making in real-world-like digital situations. From decoding phishing emails to identifying weak password policies and evaluating browser security configurations, the exam ensures you walk away with practical, applicable knowledge. Upon passing, you’ll earn a verifiable badge you can showcase on LinkedIn or your resume. This certification demonstrates foundational knowledge across phishing, malware, password hygiene, and digital hygiene—making you a safer digital citizen in today’s connected world.`
  }
];
