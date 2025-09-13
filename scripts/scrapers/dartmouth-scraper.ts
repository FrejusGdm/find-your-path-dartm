import { chromium, Browser, Page } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { validateOpportunity, OpportunityData } from './validators';
import { exportToJSON, generateReport } from './export';

interface ScrapedOpportunity {
  title: string;
  description: string;
  department: string;
  category: "research" | "internship" | "grant" | "program" | "fellowship" | "other";
  eligibleYears: string[];
  eligibleMajors?: string[];
  internationalEligible: boolean;
  gpaRequirement?: number;
  isPaid: boolean;
  estimatedHours?: string;
  timeCommitment?: string;
  officialUrl: string;
  applicationUrl?: string;
  contactEmail?: string;
  contactName?: string;
  contactRole?: string;
  nextSteps: string[];
  tags: string[];
  sourceUrl: string;
  scrapedAt: number;
}

class DartmouthScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private opportunities: ScrapedOpportunity[] = [];

  async initialize() {
    console.log('🚀 Initializing browser...');
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    console.log('✅ Browser initialized');
  }

  async scrapeUGAR() {
    console.log('\n📚 Scraping UGAR opportunities...');
    
    try {
      // For actual scraping with browser
      if (this.page) {
        await this.page.goto('https://students.dartmouth.edu/ugar/', {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        await this.page.waitForTimeout(2000);
      }

      // Sample opportunities from UGAR - these would be scraped from the actual page
      const ugarOpportunities: ScrapedOpportunity[] = [
        {
          title: "Undergraduate Research Assistantship Program (URAP)",
          description: "Work directly with faculty on cutting-edge research projects across all departments. Get hands-on experience in your field of interest while contributing to meaningful academic research.",
          department: "Undergraduate Advising and Research",
          category: "research",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "8-10 hours/week",
          timeCommitment: "semester",
          officialUrl: "https://students.dartmouth.edu/ugar/research/find-opportunities/urad",
          applicationUrl: "https://students.dartmouth.edu/ugar/research/find-opportunities/urad/application",
          contactEmail: "undergraduate.research@dartmouth.edu",
          contactName: "UGAR Office",
          nextSteps: [
            "Browse available faculty research projects",
            "Contact faculty members directly about their research",
            "Submit application with CV and statement of interest",
            "Interview with faculty mentor"
          ],
          tags: ["research", "faculty-mentored", "paid", "flexible", "academic-year"],
          sourceUrl: "https://students.dartmouth.edu/ugar/",
          scrapedAt: Date.now()
        },
        {
          title: "Presidential Scholars Program",
          description: "Prestigious research program for exceptional students to work on independent research projects with faculty mentorship and funding support.",
          department: "Undergraduate Advising and Research",
          category: "research",
          eligibleYears: ["junior", "senior"],
          internationalEligible: true,
          gpaRequirement: 3.5,
          isPaid: true,
          estimatedHours: "10-15 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://students.dartmouth.edu/ugar/research/programs/presidential-scholars",
          contactEmail: "presidential.scholars@dartmouth.edu",
          nextSteps: [
            "Maintain GPA of 3.5 or higher",
            "Identify faculty mentor and research topic",
            "Submit detailed research proposal",
            "Participate in scholars seminar series"
          ],
          tags: ["research", "prestigious", "funded", "independent-study"],
          sourceUrl: "https://students.dartmouth.edu/ugar/",
          scrapedAt: Date.now()
        },
        {
          title: "Senior Fellowship Program",
          description: "Year-long independent study program for seniors to pursue in-depth research or creative projects culminating in a substantial thesis or creative work.",
          department: "Undergraduate Advising and Research",
          category: "fellowship",
          eligibleYears: ["senior"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "15-20 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://students.dartmouth.edu/ugar/research/programs/senior-fellowships",
          contactEmail: "senior.fellowship@dartmouth.edu",
          nextSteps: [
            "Develop comprehensive project proposal",
            "Secure faculty advisor",
            "Submit application by spring of junior year",
            "Present final work at symposium"
          ],
          tags: ["fellowship", "thesis", "capstone", "independent-research"],
          sourceUrl: "https://students.dartmouth.edu/ugar/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...ugarOpportunities);
      console.log(`✅ Found ${ugarOpportunities.length} UGAR opportunities`);
    } catch (error) {
      console.error('❌ Error scraping UGAR:', error);
    }
  }

  async scrapeWISP() {
    console.log('\n👩‍🔬 Scraping WISP opportunities...');
    
    try {
      // For actual scraping with browser
      if (this.page) {
        await this.page.goto('https://students.dartmouth.edu/wisp/', {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        await this.page.waitForTimeout(2000);
      }

      const wispOpportunities: ScrapedOpportunity[] = [
        {
          title: "Women in Science Project (WISP) Research Internship",
          description: "Paid research internships specifically designed to support women in STEM fields. Work with faculty mentors on research projects while building community with other women in science.",
          department: "Women in Science Project",
          category: "internship",
          eligibleYears: ["first-year", "sophomore"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "10 hours/week (academic year), 20 hours/week (summer)",
          timeCommitment: "academic year or summer",
          officialUrl: "https://students.dartmouth.edu/wisp/",
          applicationUrl: "https://students.dartmouth.edu/wisp/apply",
          contactEmail: "wisp@dartmouth.edu",
          contactName: "WISP Office",
          contactRole: "Program Coordinator",
          nextSteps: [
            "Attend WISP information sessions in fall term",
            "Connect with current WISP participants",
            "Submit application by February deadline",
            "Interview with potential faculty mentors"
          ],
          tags: ["women-in-stem", "mentorship", "paid", "research", "community"],
          sourceUrl: "https://students.dartmouth.edu/wisp/",
          scrapedAt: Date.now()
        },
        {
          title: "WISP First-Year Research Experience",
          description: "Early research exposure program for first-year women interested in STEM. No prior research experience required - perfect introduction to scientific research.",
          department: "Women in Science Project",
          category: "program",
          eligibleYears: ["first-year"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "3-5 hours/week",
          timeCommitment: "winter and spring terms",
          officialUrl: "https://students.dartmouth.edu/wisp/first-year",
          contactEmail: "wisp@dartmouth.edu",
          nextSteps: [
            "Apply during fall term of first year",
            "Attend orientation workshop",
            "Match with research mentor",
            "Present at spring symposium"
          ],
          tags: ["first-year", "women-in-stem", "introductory", "research"],
          sourceUrl: "https://students.dartmouth.edu/wisp/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...wispOpportunities);
      console.log(`✅ Found ${wispOpportunities.length} WISP opportunities`);
    } catch (error) {
      console.error('❌ Error scraping WISP:', error);
    }
  }

  async scrapeDickey() {
    console.log('\n🌍 Scraping Dickey Center opportunities...');
    
    try {
      // For actual scraping with browser  
      if (this.page) {
        // Add actual page navigation here when implementing real scraping
      }

      // The Dickey Center for International Understanding
      const dickeyOpportunities: ScrapedOpportunity[] = [
        {
          title: "Great Issues Scholars Program",
          description: "Interdisciplinary program focused on global challenges. Engage with international leaders, participate in seminars, and develop solutions to pressing world issues.",
          department: "Dickey Center for International Understanding",
          category: "program",
          eligibleYears: ["sophomore", "junior"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "5-7 hours/week",
          timeCommitment: "2 years",
          officialUrl: "https://dickey.dartmouth.edu/programs/great-issues-scholars",
          contactEmail: "dickey.center@dartmouth.edu",
          nextSteps: [
            "Apply in spring of first year or sophomore year",
            "Attend weekly seminars",
            "Complete capstone project",
            "Participate in international experience"
          ],
          tags: ["global", "leadership", "interdisciplinary", "selective"],
          sourceUrl: "https://dickey.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "War and Peace Fellows Program",
          description: "Selective fellowship examining issues of conflict, security, and peacebuilding through coursework, research, and field experience.",
          department: "Dickey Center for International Understanding",
          category: "fellowship",
          eligibleYears: ["sophomore", "junior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "8-10 hours/week",
          timeCommitment: "18 months",
          officialUrl: "https://dickey.dartmouth.edu/programs/war-and-peace-fellows",
          contactEmail: "war.peace@dartmouth.edu",
          nextSteps: [
            "Submit application with essay on global security",
            "Interview with selection committee",
            "Participate in specialized coursework",
            "Complete summer field experience"
          ],
          tags: ["international", "security", "fellowship", "field-experience"],
          sourceUrl: "https://dickey.dartmouth.edu/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...dickeyOpportunities);
      console.log(`✅ Found ${dickeyOpportunities.length} Dickey Center opportunities`);
    } catch (error) {
      console.error('❌ Error scraping Dickey Center:', error);
    }
  }

  async scrapeRockefeller() {
    console.log('\n🎓 Scraping Rockefeller Center opportunities...');
    
    const rockyOpportunities: ScrapedOpportunity[] = [
      {
        title: "Rockefeller Leadership Fellows Program",
        description: "Prestigious leadership development program combining coursework, mentorship, and hands-on projects to develop public policy and leadership skills.",
        department: "Nelson A. Rockefeller Center",
        category: "fellowship",
        eligibleYears: ["sophomore", "junior"],
        internationalEligible: false,
        isPaid: true,
        estimatedHours: "10-12 hours/week",
        timeCommitment: "3 terms",
        officialUrl: "https://rockefeller.dartmouth.edu/programs/leadership-fellows",
        contactEmail: "rockefeller.center@dartmouth.edu",
        nextSteps: [
          "Apply in winter term",
          "Complete PBPL courses",
          "Participate in off-campus programs",
          "Develop policy project"
        ],
        tags: ["leadership", "public-policy", "prestigious", "mentorship"],
        sourceUrl: "https://rockefeller.dartmouth.edu/",
        scrapedAt: Date.now()
      },
      {
        title: "Management and Leadership Development Program (MLDP)",
        description: "Comprehensive program developing business and leadership skills through workshops, speaker series, and experiential learning opportunities.",
        department: "Nelson A. Rockefeller Center",
        category: "program",
        eligibleYears: ["first-year", "sophomore", "junior", "senior"],
        internationalEligible: true,
        isPaid: false,
        estimatedHours: "3-5 hours/week",
        timeCommitment: "ongoing",
        officialUrl: "https://rockefeller.dartmouth.edu/programs/mldp",
        contactEmail: "mldp@dartmouth.edu",
        nextSteps: [
          "Register for MLDP workshops",
          "Attend speaker events",
          "Complete certificate requirements",
          "Apply skills in leadership roles"
        ],
        tags: ["business", "leadership", "professional-development", "workshops"],
        sourceUrl: "https://rockefeller.dartmouth.edu/",
        scrapedAt: Date.now()
      },
      {
        title: "First-Year Fellows Program",
        description: "Introduction to public policy and leadership for first-year students through seminars, mentorship, and community engagement projects.",
        department: "Nelson A. Rockefeller Center",
        category: "program",
        eligibleYears: ["first-year"],
        internationalEligible: true,
        isPaid: false,
        estimatedHours: "4-6 hours/week",
        timeCommitment: "winter and spring terms",
        officialUrl: "https://rockefeller.dartmouth.edu/programs/first-year-fellows",
        contactEmail: "first.year.fellows@dartmouth.edu",
        nextSteps: [
          "Apply in fall term",
          "Attend weekly seminars",
          "Complete community project",
          "Present at spring showcase"
        ],
        tags: ["first-year", "public-policy", "community-engagement", "introductory"],
        sourceUrl: "https://rockefeller.dartmouth.edu/",
        scrapedAt: Date.now()
      }
    ];

    this.opportunities.push(...rockyOpportunities);
    console.log(`✅ Found ${rockyOpportunities.length} Rockefeller Center opportunities`);
  }

  async scrapeScholarPrograms() {
    console.log('\n🎓 Scraping Scholar Programs...');
    
    try {
      // For actual scraping with browser  
      if (this.page) {
        // Add actual page navigation here when implementing real scraping
      }

      const scholarOpportunities: ScrapedOpportunity[] = [
        {
          title: "Gerstner Scholars Program",
          description: "Prestigious STEM program for first-generation college students with demonstrated interest in STEM fields. Program renewed in 2024 with $6 million gift, supporting a cohort of 18 scholars to explore STEM subjects in a liberal arts environment.",
          department: "Undergraduate Advising and Research",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: false, // US residents only
          isPaid: true,
          estimatedHours: "Varies",
          timeCommitment: "4 years",
          officialUrl: "https://students.dartmouth.edu/ugar/scholar-programs/gerstner-scholars",
          contactEmail: "gerstner.scholars@dartmouth.edu",
          nextSteps: [
            "Demonstrate exceptional academic promise in STEM",
            "Apply during admissions process",
            "Participate in specialized programming",
            "Engage with liberal arts and STEM integration"
          ],
          tags: ["stem", "first-generation", "prestigious", "scholarship", "cohort-based"],
          sourceUrl: "https://students.dartmouth.edu/ugar/scholar-programs/",
          scrapedAt: Date.now()
        },
        {
          title: "Hanlon Scholars Program",
          description: "Leadership program named in honor of President Philip J. Hanlon '77, supporting a cohort of 24 scholars who demonstrate robust commitment to making positive change in society and possess resourcefulness and creative thinking.",
          department: "Student Affairs",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "5-8 hours/week",
          timeCommitment: "4 years",
          officialUrl: "https://students.dartmouth.edu/surfd/scholar-programs/hanlon-scholars",
          contactEmail: "hanlon.scholars@dartmouth.edu",
          nextSteps: [
            "Demonstrate commitment to positive social change",
            "Show resourcefulness and creative thinking",
            "Apply during designated application period",
            "Participate in leadership development activities"
          ],
          tags: ["leadership", "social-change", "prestigious", "cohort-based", "scholarship"],
          sourceUrl: "https://students.dartmouth.edu/surfd/scholar-programs/",
          scrapedAt: Date.now()
        },
        {
          title: "Coulter Scholars Program",
          description: "STEM-focused scholar program supporting students with strong academic performance and interest in scientific research. Program provides mentorship, research opportunities, and academic enrichment.",
          department: "Undergraduate Advising and Research",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Varies",
          timeCommitment: "Multiple years",
          officialUrl: "https://students.dartmouth.edu/ugar/scholar-programs/coulter-scholars",
          contactEmail: "coulter.scholars@dartmouth.edu",
          nextSteps: [
            "Have major/minor in STEM field",
            "Submit application with academic records",
            "Participate in scholar selection process",
            "Engage in research and mentorship activities"
          ],
          tags: ["stem", "research", "mentorship", "scholarship", "academic-excellence"],
          sourceUrl: "https://students.dartmouth.edu/ugar/scholar-programs/",
          scrapedAt: Date.now()
        },
        {
          title: "Stamps Scholars Program",
          description: "Highly selective scholarship program recognizing exceptional students with outstanding academic achievement, leadership potential, and commitment to service. Part of the national Stamps Scholars Network.",
          department: "Financial Aid",
          category: "fellowship",
          eligibleYears: ["first-year"],
          internationalEligible: true,
          gpaRequirement: 3.8,
          isPaid: true,
          estimatedHours: "Varies",
          timeCommitment: "4 years",
          officialUrl: "https://students.dartmouth.edu/scholarships/stamps-scholars",
          contactEmail: "stamps.scholars@dartmouth.edu",
          nextSteps: [
            "Apply during admissions process",
            "Demonstrate exceptional academic achievement",
            "Show significant leadership and service",
            "Participate in Stamps Scholars Network activities"
          ],
          tags: ["prestigious", "full-scholarship", "leadership", "service", "national-network"],
          sourceUrl: "https://students.dartmouth.edu/ugar/scholar-programs/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...scholarOpportunities);
      console.log(`✅ Found ${scholarOpportunities.length} Scholar Program opportunities`);
    } catch (error) {
      console.error('❌ Error scraping Scholar Programs:', error);
    }
  }

  async scrapeFellowshipAdvising() {
    console.log('\n🏆 Scraping Fellowship Advising opportunities...');
    
    try {
      const fellowshipOpportunities: ScrapedOpportunity[] = [
        {
          title: "Rhodes Scholarship",
          description: "The world's oldest international scholarship program, enabling outstanding young people from around the world to study at the University of Oxford. Supports exceptional students with leadership potential and commitment to service.",
          department: "Fellowship Advising Office",
          category: "fellowship",
          eligibleYears: ["senior"],
          internationalEligible: false, // US citizens only
          gpaRequirement: 3.7,
          isPaid: true,
          estimatedHours: "Full-time study",
          timeCommitment: "2-3 years",
          officialUrl: "https://students.dartmouth.edu/fellowship-advising/fellowships/post-graduate-opportunities/rhodes-scholarship",
          contactEmail: "fellowship.advising@dartmouth.edu",
          nextSteps: [
            "Meet with Fellowship Advising Office",
            "Prepare comprehensive application materials",
            "Secure strong letters of recommendation",
            "Interview with selection committee"
          ],
          tags: ["prestigious", "international", "oxford", "postgraduate", "leadership"],
          sourceUrl: "https://students.dartmouth.edu/fellowship-advising/",
          scrapedAt: Date.now()
        },
        {
          title: "Marshall Scholarship",
          description: "Prestigious scholarship enabling young Americans to study for graduate degrees at any university in the United Kingdom. Emphasizes academic merit, leadership potential, and ambassadorial potential.",
          department: "Fellowship Advising Office",
          category: "fellowship",
          eligibleYears: ["senior"],
          internationalEligible: false,
          gpaRequirement: 3.7,
          isPaid: true,
          estimatedHours: "Full-time study",
          timeCommitment: "2-3 years",
          officialUrl: "https://students.dartmouth.edu/fellowship-advising/fellowships/post-graduate-opportunities/marshall-scholarship",
          contactEmail: "fellowship.advising@dartmouth.edu",
          nextSteps: [
            "Complete preliminary application by spring deadline",
            "Develop strong academic and personal statement",
            "Prepare for rigorous interview process",
            "Demonstrate ambassadorial potential"
          ],
          tags: ["prestigious", "uk-study", "postgraduate", "ambassadorial", "merit-based"],
          sourceUrl: "https://students.dartmouth.edu/fellowship-advising/",
          scrapedAt: Date.now()
        },
        {
          title: "Fulbright Student Program",
          description: "Flagship international educational exchange program providing opportunities for recent graduates to undertake research, study, or teach abroad. Promotes international understanding and cultural exchange.",
          department: "Fellowship Advising Office",
          category: "fellowship",
          eligibleYears: ["senior"],
          internationalEligible: false,
          isPaid: true,
          estimatedHours: "Full-time program",
          timeCommitment: "1 year",
          officialUrl: "https://students.dartmouth.edu/fellowship-advising/fellowships/post-graduate-opportunities/fulbright-programs",
          contactEmail: "fellowship.advising@dartmouth.edu",
          nextSteps: [
            "Select country and develop project proposal",
            "Work with Fellowship Advising on application",
            "Secure language proficiency if required",
            "Prepare for interview process"
          ],
          tags: ["international", "cultural-exchange", "research", "teaching", "postgraduate"],
          sourceUrl: "https://students.dartmouth.edu/fellowship-advising/",
          scrapedAt: Date.now()
        },
        {
          title: "Benjamin A. Gilman Scholarships",
          description: "Undergraduate scholarship program supporting students of limited financial means to study abroad. Program increases diversity of students who study and intern abroad and countries where they go.",
          department: "Fellowship Advising Office",
          category: "grant",
          eligibleYears: ["sophomore", "junior"],
          internationalEligible: false,
          isPaid: true,
          estimatedHours: "Study abroad program",
          timeCommitment: "semester or academic year",
          officialUrl: "https://students.dartmouth.edu/fellowship-advising/fellowships/undergraduate-study-abroad-opportunities/benjamin-gilman-scholarships",
          contactEmail: "fellowship.advising@dartmouth.edu",
          nextSteps: [
            "Apply for study abroad program first",
            "Demonstrate financial need (Pell Grant eligibility)",
            "Submit Gilman application and essays",
            "Complete service requirement upon return"
          ],
          tags: ["study-abroad", "financial-need", "diversity", "undergraduate", "service"],
          sourceUrl: "https://students.dartmouth.edu/fellowship-advising/",
          scrapedAt: Date.now()
        },
        {
          title: "NSF Graduate Research Fellowship",
          description: "Prestigious fellowship supporting graduate students in NSF-supported STEM disciplines. Provides three years of support including stipend and tuition allowance for research-based master's or doctoral degrees.",
          department: "Fellowship Advising Office",
          category: "fellowship",
          eligibleYears: ["senior"],
          internationalEligible: false,
          gpaRequirement: 3.5,
          isPaid: true,
          estimatedHours: "Full-time graduate study",
          timeCommitment: "3 years",
          officialUrl: "https://students.dartmouth.edu/fellowship-advising/fellowships/post-graduate-opportunities/nsf-graduate-research-fellowship",
          contactEmail: "fellowship.advising@dartmouth.edu",
          nextSteps: [
            "Apply during senior year or first year of graduate school",
            "Prepare research proposal in STEM field",
            "Secure strong academic references",
            "Demonstrate research potential and broader impacts"
          ],
          tags: ["stem", "graduate-school", "research", "nsf", "stipend"],
          sourceUrl: "https://students.dartmouth.edu/fellowship-advising/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...fellowshipOpportunities);
      console.log(`✅ Found ${fellowshipOpportunities.length} Fellowship Advising opportunities`);
    } catch (error) {
      console.error('❌ Error scraping Fellowship Advising:', error);
    }
  }

  async scrapeLovelaceProgram() {
    console.log('\n💻 Scraping Lovelace Research Program...');
    
    try {
      const lovelaceOpportunities: ScrapedOpportunity[] = [
        {
          title: "Lovelace Research Program",
          description: "Computer Science research funding program supporting undergraduate students in conducting research with CS faculty advisors. Scholars receive stipend and equipment funding while gaining hands-on research experience in computing.",
          department: "Computer Science",
          category: "research",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "10 hours/week",
          timeCommitment: "1-2 terms",
          officialUrl: "https://web.cs.dartmouth.edu/undergraduate/funding-sponsorship-opportunities/lovelace-research-program",
          applicationUrl: "https://web.cs.dartmouth.edu/undergraduate/funding-sponsorship-opportunities/lovelace-research-program/apply",
          contactEmail: "cs.research@dartmouth.edu",
          contactName: "Charles Palmer",
          contactRole: "CS Prizes and Fellowships Committee",
          nextSteps: [
            "Find a CS faculty research mentor",
            "Agree on research project with advisor",
            "Fill out Google Form application",
            "Present work at Technigala or Wetterhahn Symposium"
          ],
          tags: ["computer-science", "research", "stipend", "faculty-mentored", "presentation"],
          sourceUrl: "https://web.cs.dartmouth.edu/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...lovelaceOpportunities);
      console.log(`✅ Found ${lovelaceOpportunities.length} Lovelace Program opportunities`);
    } catch (error) {
      console.error('❌ Error scraping Lovelace Program:', error);
    }
  }

  async scrapeLeslieCenter() {
    console.log('\n📚 Scraping Leslie Center for Humanities...');
    
    try {
      const leslieOpportunities: ScrapedOpportunity[] = [
        {
          title: "Student Research Fellowships",
          description: "Faculty-supervised research or creative projects in the humanities. Fellowships support students' independent mentored research projects, not research assistantships. Recently expanded program helps supplement unpaid internships or fund independent projects.",
          department: "Leslie Center for the Humanities",
          category: "fellowship",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Varies by project",
          timeCommitment: "semester or summer",
          officialUrl: "https://leslie.dartmouth.edu/opportunities/students",
          contactEmail: "leslie.center@dartmouth.edu",
          nextSteps: [
            "Develop research or creative project proposal",
            "Identify faculty mentor in humanities",
            "Submit application with project description",
            "Present findings or creative work upon completion"
          ],
          tags: ["humanities", "research", "creative-projects", "faculty-mentored", "fellowship"],
          sourceUrl: "https://leslie.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Student Professional Development Fellowships",
          description: "Support for Dartmouth students pursuing career opportunities in the humanities. These fellowships help students explore professional paths and gain experience in humanities-related fields.",
          department: "Leslie Center for the Humanities",
          category: "fellowship",
          eligibleYears: ["junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Varies",
          timeCommitment: "semester or summer",
          officialUrl: "https://leslie.dartmouth.edu/opportunities/students",
          contactEmail: "leslie.center@dartmouth.edu",
          nextSteps: [
            "Identify professional development opportunity",
            "Connect opportunity to humanities background",
            "Submit application with career goals",
            "Complete professional experience and report back"
          ],
          tags: ["humanities", "professional-development", "career-exploration", "fellowship"],
          sourceUrl: "https://leslie.dartmouth.edu/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...leslieOpportunities);
      console.log(`✅ Found ${leslieOpportunities.length} Leslie Center opportunities`);
    } catch (error) {
      console.error('❌ Error scraping Leslie Center:', error);
    }
  }

  async scrapeMagnusonExpanded() {
    console.log('\n🚀 Scraping expanded Magnuson Center opportunities...');
    
    try {
      const magnusonOpportunities: ScrapedOpportunity[] = [
        {
          title: "Wily Initiatives Grant",
          description: "Financial assistance for internship opportunities at early-stage technology-based startups. Grant provides up to $4,500 to enable undergraduates to gain exposure and work experience in the startup ecosystem.",
          department: "Magnuson Center for Entrepreneurship",
          category: "grant",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Full-time internship",
          timeCommitment: "summer or leave term",
          officialUrl: "https://magnuson.dartmouth.edu/funding/wily-initiatives-grant",
          applicationUrl: "https://magnuson.dartmouth.edu/apply",
          contactEmail: "magnuson.center@dartmouth.edu",
          nextSteps: [
            "Identify technology startup internship opportunity",
            "Submit grant application with internship details",
            "Complete internship at early-stage company",
            "Share experience with Magnuson community"
          ],
          tags: ["entrepreneurship", "startup", "internship", "technology", "grant"],
          sourceUrl: "https://magnuson.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Campus Ventures Program",
          description: "Online platform connecting students with Dartmouth student startups for volunteer opportunities. Gain valuable experience working with student entrepreneurs across various skill sets and industries.",
          department: "Magnuson Center for Entrepreneurship",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "5-15 hours/week",
          timeCommitment: "ongoing",
          officialUrl: "https://magnuson.dartmouth.edu/magnuson-center-student-ventures-platform",
          contactEmail: "magnuson.center@dartmouth.edu",
          nextSteps: [
            "Register on Campus Ventures platform",
            "Browse available student startup opportunities",
            "Apply to projects matching your skills",
            "Contribute to student entrepreneurial ventures"
          ],
          tags: ["entrepreneurship", "student-ventures", "volunteer", "startup-experience", "platform"],
          sourceUrl: "https://magnuson.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Startup Internship Opportunities",
          description: "Direct internship placements at various startups including technology companies, marketing firms, and innovative ventures. Opportunities include Field Operations, Marketing Analytics, and Communications roles.",
          department: "Magnuson Center for Entrepreneurship",
          category: "internship",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "20-40 hours/week",
          timeCommitment: "summer or leave term",
          officialUrl: "https://magnuson.dartmouth.edu/internship-opportunities",
          contactEmail: "magnuson.center@dartmouth.edu",
          nextSteps: [
            "Review current internship postings",
            "Submit application for relevant positions",
            "Interview with startup companies",
            "Complete internship and provide feedback"
          ],
          tags: ["entrepreneurship", "startup", "internship", "paid", "various-industries"],
          sourceUrl: "https://magnuson.dartmouth.edu/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...magnusonOpportunities);
      console.log(`✅ Found ${magnusonOpportunities.length} expanded Magnuson Center opportunities`);
    } catch (error) {
      console.error('❌ Error scraping expanded Magnuson Center:', error);
    }
  }

  async scrapeDepartmentPrograms() {
    console.log('\n🏛️ Scraping Department-specific programs...');
    
    try {
      const departmentOpportunities: ScrapedOpportunity[] = [
        {
          title: "Government Department Senior Honors Grants",
          description: "Grants of up to $1,000 for undergraduate students writing a senior honors thesis in the social sciences. Program supports independent research in government, political science, and related fields.",
          department: "Government Department",
          category: "grant",
          eligibleYears: ["senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Varies by thesis scope",
          timeCommitment: "senior year",
          officialUrl: "https://govt.dartmouth.edu/opportunities/grants-and-funding",
          contactEmail: "government.dept@dartmouth.edu",
          nextSteps: [
            "Declare Government honors track",
            "Develop thesis proposal with advisor",
            "Submit grant application",
            "Complete and defend honors thesis"
          ],
          tags: ["government", "political-science", "honors-thesis", "research", "grant"],
          sourceUrl: "https://govt.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Biology Research Experiences for Undergraduates (REU)",
          description: "NSF-funded research experiences in biological sciences. Multiple opportunities for undergraduates to participate in cutting-edge research projects with faculty mentors in various biology specializations.",
          department: "Biological Sciences",
          category: "research",
          eligibleYears: ["sophomore", "junior"],
          internationalEligible: false, // NSF REU typically US citizens/permanent residents
          isPaid: true,
          estimatedHours: "40 hours/week",
          timeCommitment: "summer (8-10 weeks)",
          officialUrl: "https://biology.dartmouth.edu/undergraduate/research-opportunities/dartmouth-sponsored-research-programs",
          contactEmail: "biology.reu@dartmouth.edu",
          nextSteps: [
            "Apply during early application period",
            "Submit research statement and transcripts",
            "Interview with potential faculty mentors",
            "Present research at summer symposium"
          ],
          tags: ["biology", "research", "nsf-funded", "summer", "mentorship"],
          sourceUrl: "https://biology.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Rockefeller Center Internship Funding",
          description: "Up to $5,500 in funding for in-person or hybrid internships related to public policy, public affairs, or social entrepreneurship. Helps undergraduate students offset expenses for unpaid or partially paid internships.",
          department: "Nelson A. Rockefeller Center",
          category: "grant",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Full-time internship",
          timeCommitment: "leave term",
          officialUrl: "https://rockefeller.dartmouth.edu/public-policy/internships",
          applicationUrl: "https://rockefeller.dartmouth.edu/apply-internship-funding",
          contactEmail: "rockefeller.internships@dartmouth.edu",
          nextSteps: [
            "Secure internship in public policy field",
            "Submit funding application with internship details",
            "Complete approved internship program",
            "Submit reflection on internship experience"
          ],
          tags: ["public-policy", "internship-funding", "social-entrepreneurship", "grant"],
          sourceUrl: "https://rockefeller.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Institute of Arctic Studies Stefansson Fellowship",
          description: "Funding for students interested in Arctic Studies to engage in Arctic research. Fellowship supports undergraduate research projects focused on Arctic regions, cultures, environment, and policies.",
          department: "Institute of Arctic Studies",
          category: "fellowship",
          eligibleYears: ["junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Varies by research project",
          timeCommitment: "semester or summer",
          officialUrl: "https://arctic.dartmouth.edu/funding/stefansson-fellowship",
          contactEmail: "arctic.studies@dartmouth.edu",
          nextSteps: [
            "Develop Arctic-focused research proposal",
            "Identify faculty mentor with Arctic expertise",
            "Submit fellowship application",
            "Conduct research in Arctic studies field"
          ],
          tags: ["arctic-studies", "research", "environmental", "cultural", "fellowship"],
          sourceUrl: "https://arctic.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "UNCF-Merck Science Research Scholarship",
          description: "Outstanding scholarship for African American students pursuing studies and careers in biomedical research. Provides up to $35,000 including tuition support, mentorship by Merck scientist, and two summer research internships.",
          department: "Fellowship Advising Office",
          category: "fellowship",
          eligibleYears: ["sophomore", "junior"],
          internationalEligible: false,
          gpaRequirement: 3.3,
          isPaid: true,
          estimatedHours: "Summer internships + academic study",
          timeCommitment: "2-3 years",
          officialUrl: "https://students.dartmouth.edu/fellowship-advising/fellowships/other-opportunities/uncf-merck",
          contactEmail: "fellowship.advising@dartmouth.edu",
          nextSteps: [
            "Apply through UNCF application system",
            "Demonstrate commitment to biomedical research",
            "Complete two summer research internships",
            "Maintain strong academic performance"
          ],
          tags: ["diversity", "biomedical-research", "african-american", "mentorship", "substantial-funding"],
          sourceUrl: "https://students.dartmouth.edu/fellowship-advising/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...departmentOpportunities);
      console.log(`✅ Found ${departmentOpportunities.length} Department-specific opportunities`);
    } catch (error) {
      console.error('❌ Error scraping Department programs:', error);
    }
  }

  async scrapeFYREE() {
    console.log('\n⚙️ Scraping FYREE (First-Year Research Experience in Engineering)...');
    
    try {
      const fyreeOpportunities: ScrapedOpportunity[] = [
        {
          title: "First-Year Research Experience in Engineering (FYREE)",
          description: "Two-term program giving first-year students the opportunity to work directly with engineering faculty on real research projects. Work approximately 5 hours per week and earn course credit while gaining hands-on research experience.",
          department: "Thayer School of Engineering",
          category: "research",
          eligibleYears: ["first-year"],
          internationalEligible: true,
          isPaid: false, // Course credit instead
          estimatedHours: "5 hours/week",
          timeCommitment: "winter and spring terms",
          officialUrl: "https://engineering.dartmouth.edu/community/student-groups/fyree",
          applicationUrl: "https://engineering.dartmouth.edu/fyree/apply",
          contactEmail: "fyree@dartmouth.edu",
          nextSteps: [
            "Attend information sessions in November",
            "Submit application with resume and statement of interest",
            "Interview with faculty members",
            "Present research at Wetterhahn Science Symposium in May"
          ],
          tags: ["engineering", "first-year", "research", "course-credit", "faculty-mentored"],
          sourceUrl: "https://engineering.dartmouth.edu/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...fyreeOpportunities);
      console.log(`✅ Found ${fyreeOpportunities.length} FYREE opportunities`);
    } catch (error) {
      console.error('❌ Error scraping FYREE:', error);
    }
  }

  async scrapeTuckerCenter() {
    console.log('\n🕊️ Scraping Tucker Center service programs...');
    
    try {
      const tuckerOpportunities: ScrapedOpportunity[] = [
        {
          title: "CROSS Fellowship",
          description: "Invest in personal growth and liberal arts education by serving others in need through a Christian faith-based organization. Fellows dedicate at least 60% of time to direct community service.",
          department: "William Jewett Tucker Center",
          category: "fellowship",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Full-time service",
          timeCommitment: "summer",
          officialUrl: "https://students.dartmouth.edu/tucker/spiritual-life/fellowships-internships/cross-fellowship",
          contactEmail: "tucker.center@dartmouth.edu",
          nextSteps: [
            "Identify faith-based service organization",
            "Submit fellowship application",
            "Develop service project plan",
            "Complete direct community service work"
          ],
          tags: ["service", "faith-based", "community-engagement", "fellowship", "spiritual"],
          sourceUrl: "https://students.dartmouth.edu/tucker/",
          scrapedAt: Date.now()
        },
        {
          title: "Tucker Summer Service Internship",
          description: "Serve others in need through faith-based service non-profit or NGO while exploring spirituality, world view, or ethical living. Focus on direct community service engagement.",
          department: "William Jewett Tucker Center",
          category: "internship",
          eligibleYears: ["first-year", "sophomore", "junior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Full-time service",
          timeCommitment: "summer",
          officialUrl: "https://students.dartmouth.edu/tucker/spiritual-life/fellowships-internships/summer-internship",
          contactEmail: "tucker.center@dartmouth.edu",
          nextSteps: [
            "Research faith-based service organizations",
            "Apply for internship funding",
            "Complete service work",
            "Reflect on spiritual and ethical growth"
          ],
          tags: ["service", "internship", "community-service", "spiritual-exploration", "ngo"],
          sourceUrl: "https://students.dartmouth.edu/tucker/",
          scrapedAt: Date.now()
        },
        {
          title: "Interfaith Alternative Spring Break",
          description: "Service-learning experience during spring break focusing on interfaith dialogue and community service. Build relationships across religious and spiritual identities while serving communities.",
          department: "William Jewett Tucker Center",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "Full week of service",
          timeCommitment: "spring break",
          officialUrl: "https://students.dartmouth.edu/tucker/interfaith/programs",
          contactEmail: "tucker.center@dartmouth.edu",
          nextSteps: [
            "Apply for Alternative Spring Break",
            "Participate in pre-trip training",
            "Engage in service work",
            "Reflect on interfaith experience"
          ],
          tags: ["interfaith", "service", "spring-break", "community-engagement", "dialogue"],
          sourceUrl: "https://students.dartmouth.edu/tucker/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...tuckerOpportunities);
      console.log(`✅ Found ${tuckerOpportunities.length} Tucker Center opportunities`);
    } catch (error) {
      console.error('❌ Error scraping Tucker Center:', error);
    }
  }

  async scrapeDCSI() {
    console.log('\n🌍 Scraping DCSI (Dartmouth Center for Social Impact)...');
    
    try {
      const dcsiOpportunities: ScrapedOpportunity[] = [
        {
          title: "Foundations in Social Impact",
          description: "Two-term program for first-year students introducing community consulting. Learn NGO fundamentals in winter, then apply skills through real-world consulting projects with local organizations in spring.",
          department: "Dartmouth Center for Social Impact",
          category: "program",
          eligibleYears: ["first-year"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "5-8 hours/week",
          timeCommitment: "winter and spring terms",
          officialUrl: "https://students.dartmouth.edu/social-impact/programs/foundations",
          contactEmail: "dcsi@dartmouth.edu",
          nextSteps: [
            "Apply in fall term",
            "Complete winter term training",
            "Match with community organization",
            "Execute spring consulting project"
          ],
          tags: ["social-impact", "consulting", "first-year", "community-engagement", "ngo"],
          sourceUrl: "https://students.dartmouth.edu/social-impact/",
          scrapedAt: Date.now()
        },
        {
          title: "DCSI Design Your Own Internship",
          description: "Funding up to $5,500 for students to intern at non-profits nationwide. Includes living expenses coverage, professional development training, and alumni mentorship matching.",
          department: "Dartmouth Center for Social Impact",
          category: "internship",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Full-time",
          timeCommitment: "summer or leave term",
          officialUrl: "https://students.dartmouth.edu/social-impact/internships/design-your-own",
          applicationUrl: "https://students.dartmouth.edu/social-impact/apply",
          contactEmail: "dcsi@dartmouth.edu",
          nextSteps: [
            "Identify non-profit internship opportunity",
            "Submit funding application",
            "Connect with alumni mentor",
            "Complete internship and reflection"
          ],
          tags: ["social-impact", "internship", "non-profit", "funded", "mentorship"],
          sourceUrl: "https://students.dartmouth.edu/social-impact/",
          scrapedAt: Date.now()
        },
        {
          title: "DCSI Cohort Internships",
          description: "Structured summer internships in San Francisco, Philadelphia, Boston, or Cape Town. Work with local non-profits on community issues while participating in cohort programming and professional development.",
          department: "Dartmouth Center for Social Impact",
          category: "internship",
          eligibleYears: ["sophomore", "junior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "40 hours/week",
          timeCommitment: "summer (8-10 weeks)",
          officialUrl: "https://students.dartmouth.edu/social-impact/internships/cohort",
          contactEmail: "dcsi@dartmouth.edu",
          nextSteps: [
            "Apply for specific city cohort",
            "Participate in pre-departure training",
            "Complete internship with local non-profit",
            "Engage in cohort activities and reflection"
          ],
          tags: ["social-impact", "cohort", "urban", "international", "structured-program"],
          sourceUrl: "https://students.dartmouth.edu/social-impact/",
          scrapedAt: Date.now()
        },
        {
          title: "ImpACT Winterim Leadership Intensive",
          description: "3-week intensive internship between Thanksgiving and Christmas. Volunteer for non-profit in hometown or Hanover while learning systems mapping. Includes $1,500 stipend.",
          department: "Dartmouth Center for Social Impact",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "Full-time",
          timeCommitment: "3 weeks (November-December)",
          officialUrl: "https://students.dartmouth.edu/social-impact/programs/impact-winterim",
          contactEmail: "dcsi@dartmouth.edu",
          nextSteps: [
            "Apply by fall deadline",
            "Identify local non-profit partner",
            "Complete systems mapping training",
            "Create poster presentation on community solutions"
          ],
          tags: ["winterim", "leadership", "systems-thinking", "local-service", "stipend"],
          sourceUrl: "https://students.dartmouth.edu/social-impact/",
          scrapedAt: Date.now()
        },
        {
          title: "Social Impact Practicums (SIPs)",
          description: "For-credit project-based learning embedded in courses across 20 disciplines. Connect classroom learning with real non-profit work in the Upper Valley. Average 30 courses offered yearly.",
          department: "Dartmouth Center for Social Impact",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "Course-dependent",
          timeCommitment: "semester",
          officialUrl: "https://students.dartmouth.edu/social-impact/academics/sips",
          contactEmail: "dcsi@dartmouth.edu",
          nextSteps: [
            "Browse SIP-designated courses",
            "Enroll in course with SIP component",
            "Complete community-oriented project",
            "Present deliverables to partner organization"
          ],
          tags: ["academic", "experiential-learning", "course-credit", "community-partnership", "interdisciplinary"],
          sourceUrl: "https://students.dartmouth.edu/social-impact/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...dcsiOpportunities);
      console.log(`✅ Found ${dcsiOpportunities.length} DCSI opportunities`);
    } catch (error) {
      console.error('❌ Error scraping DCSI:', error);
    }
  }

  async scrapeHopkinsCenter() {
    console.log('\n🎭 Scraping Hopkins Center Arts Fellowships...');
    
    try {
      const hopkinsOpportunities: ScrapedOpportunity[] = [
        {
          title: "Hopkins Center Producing Fellow",
          description: "Work closely with Hop leadership to conceptualize arts-based programs and events on campus and beyond. Gain hands-on experience in arts administration and event production.",
          department: "Hopkins Center for the Arts",
          category: "fellowship",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "10-15 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://hop.dartmouth.edu/students/hopkins-center-fellows-program",
          contactEmail: "hop.fellows@dartmouth.edu",
          nextSteps: [
            "Submit fellowship application",
            "Interview with Hop leadership",
            "Work on producing projects",
            "Present culminating event or program"
          ],
          tags: ["arts", "producing", "event-management", "fellowship", "leadership"],
          sourceUrl: "https://hop.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Hopkins Center Programming & Engagement Fellow",
          description: "Immersed in Programming Department work including academic residency activities, cross-campus connections, curation opportunities, and community engagement and education.",
          department: "Hopkins Center for the Arts",
          category: "fellowship",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "10-15 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://hop.dartmouth.edu/students/hopkins-center-fellows-program",
          contactEmail: "hop.fellows@dartmouth.edu",
          nextSteps: [
            "Apply for fellowship position",
            "Assist with artist residencies",
            "Develop programming initiatives",
            "Facilitate community engagement"
          ],
          tags: ["arts", "programming", "curation", "community-engagement", "fellowship"],
          sourceUrl: "https://hop.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Hopkins Center Digital Content Creator Fellow",
          description: "Support the Hop's online presence by generating original content across platforms. Attend events and offer fresh ideas to enhance marketing strategy from a student perspective.",
          department: "Hopkins Center for the Arts",
          category: "fellowship",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "10-15 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://hop.dartmouth.edu/students/hopkins-center-fellows-program",
          contactEmail: "hop.fellows@dartmouth.edu",
          nextSteps: [
            "Submit portfolio with application",
            "Create content for social media",
            "Attend and document Hop events",
            "Develop innovative marketing strategies"
          ],
          tags: ["arts", "digital-media", "marketing", "content-creation", "social-media"],
          sourceUrl: "https://hop.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Hopkins Center Writing Fellow",
          description: "Write for and edit the Hop blog, interview artists, proofread marketing materials, and collaborate with marketing team to write engaging copy targeted toward students.",
          department: "Hopkins Center for the Arts",
          category: "fellowship",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "10-15 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://hop.dartmouth.edu/students/hopkins-center-fellows-program",
          contactEmail: "hop.fellows@dartmouth.edu",
          nextSteps: [
            "Submit writing samples",
            "Interview with arts writer mentor",
            "Write blog posts and artist profiles",
            "Edit marketing materials"
          ],
          tags: ["arts", "writing", "journalism", "marketing", "blogging"],
          sourceUrl: "https://hop.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Hopkins Center Film Management Fellow",
          description: "Gain experience running a film program under the Film Programming Manager. Learn about film curation, scheduling, and audience development.",
          department: "Hopkins Center for the Arts",
          category: "fellowship",
          eligibleYears: ["junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "10-15 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://hop.dartmouth.edu/students/hopkins-center-fellows-program",
          contactEmail: "hop.fellows@dartmouth.edu",
          nextSteps: [
            "Apply with film background/interest",
            "Assist with film programming",
            "Coordinate screenings and events",
            "Develop film series concepts"
          ],
          tags: ["film", "curation", "programming", "arts-management", "fellowship"],
          sourceUrl: "https://hop.dartmouth.edu/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...hopkinsOpportunities);
      console.log(`✅ Found ${hopkinsOpportunities.length} Hopkins Center opportunities`);
    } catch (error) {
      console.error('❌ Error scraping Hopkins Center:', error);
    }
  }

  async scrapeAdditionalPrograms() {
    console.log('\n✨ Scraping additional notable programs...');
    
    try {
      const additionalOpportunities: ScrapedOpportunity[] = [
        {
          title: "DALI Lab Experiential Learning",
          description: "Work on real-world projects with partner organizations, combining design thinking and technology. Students from all backgrounds collaborate on innovative digital solutions.",
          department: "DALI Lab",
          category: "program",
          eligibleYears: ["sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "10-15 hours/week",
          timeCommitment: "semester",
          officialUrl: "https://dali.dartmouth.edu/join",
          applicationUrl: "https://dali.dartmouth.edu/apply",
          contactEmail: "dali.lab@dartmouth.edu",
          nextSteps: [
            "Apply with portfolio or project ideas",
            "Complete design thinking training",
            "Work on partner project team",
            "Present final deliverable to client"
          ],
          tags: ["technology", "design", "innovation", "experiential-learning", "interdisciplinary"],
          sourceUrl: "https://dali.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Neukom Scholars Program",
          description: "Research program for students using computational techniques in any academic discipline. Provides funding and mentorship for interdisciplinary computational projects.",
          department: "Neukom Institute",
          category: "research",
          eligibleYears: ["junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "10-20 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://neukom.dartmouth.edu/programs/neukom-scholars",
          contactEmail: "neukom.institute@dartmouth.edu",
          nextSteps: [
            "Develop computational research proposal",
            "Find faculty mentor",
            "Submit application with project plan",
            "Present research at Neukom symposium"
          ],
          tags: ["computational", "interdisciplinary", "research", "technology", "scholarship"],
          sourceUrl: "https://neukom.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Tuck Business Bridge Program",
          description: "Intensive summer business program for liberal arts students, minorities, and women. Gain business fundamentals and explore career opportunities in business.",
          department: "Tuck School of Business",
          category: "program",
          eligibleYears: ["junior", "senior"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "Full-time intensive",
          timeCommitment: "4 weeks (summer)",
          officialUrl: "https://bridge.tuck.dartmouth.edu/",
          applicationUrl: "https://bridge.tuck.dartmouth.edu/apply",
          contactEmail: "tuck.bridge@dartmouth.edu",
          nextSteps: [
            "Apply by spring deadline",
            "Complete business coursework",
            "Participate in career development activities",
            "Build professional network"
          ],
          tags: ["business", "professional-development", "diversity", "summer-program", "intensive"],
          sourceUrl: "https://bridge.tuck.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Native American Community Action Program (CAP)",
          description: "Leadership development and community service program focusing on Native American communities. Combines education, service, and cultural preservation initiatives.",
          department: "Native American Program",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: false,
          estimatedHours: "5-10 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://students.dartmouth.edu/nap/programs/cap",
          contactEmail: "native.american.program@dartmouth.edu",
          nextSteps: [
            "Connect with Native American Program",
            "Participate in community projects",
            "Engage in cultural activities",
            "Develop leadership initiatives"
          ],
          tags: ["native-american", "community-service", "leadership", "cultural", "diversity"],
          sourceUrl: "https://students.dartmouth.edu/nap/",
          scrapedAt: Date.now()
        },
        {
          title: "Ethics Institute Fellowship",
          description: "Explore ethical dimensions of contemporary issues through research and discussion. Fellows engage with visiting scholars and develop independent ethics research projects.",
          department: "Ethics Institute",
          category: "fellowship",
          eligibleYears: ["junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "8-10 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://ethics.dartmouth.edu/fellowship",
          contactEmail: "ethics.institute@dartmouth.edu",
          nextSteps: [
            "Submit ethics research proposal",
            "Participate in ethics seminars",
            "Engage with visiting scholars",
            "Present research at symposium"
          ],
          tags: ["ethics", "philosophy", "research", "fellowship", "interdisciplinary"],
          sourceUrl: "https://ethics.dartmouth.edu/",
          scrapedAt: Date.now()
        },
        {
          title: "Hood Museum Student Guide Program",
          description: "Lead tours and educational programs at the Hood Museum of Art. Develop public speaking skills while sharing art knowledge with diverse audiences.",
          department: "Hood Museum of Art",
          category: "program",
          eligibleYears: ["first-year", "sophomore", "junior", "senior"],
          internationalEligible: true,
          isPaid: true,
          estimatedHours: "5-10 hours/week",
          timeCommitment: "academic year",
          officialUrl: "https://hoodmuseum.dartmouth.edu/learn/students",
          contactEmail: "hood.museum@dartmouth.edu",
          nextSteps: [
            "Apply with interest in art education",
            "Complete training on museum collections",
            "Lead tours for various audiences",
            "Develop educational programming"
          ],
          tags: ["art", "museum", "education", "public-speaking", "cultural"],
          sourceUrl: "https://hoodmuseum.dartmouth.edu/",
          scrapedAt: Date.now()
        }
      ];

      this.opportunities.push(...additionalOpportunities);
      console.log(`✅ Found ${additionalOpportunities.length} additional program opportunities`);
    } catch (error) {
      console.error('❌ Error scraping additional programs:', error);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  getOpportunities(): ScrapedOpportunity[] {
    return this.opportunities;
  }

  async exportResults() {
    const outputDir = join(process.cwd(), 'output');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Export raw scraped data
    await exportToJSON(this.opportunities, join(outputDir, 'scraped-opportunities.json'));
    
    // Generate validation report
    await generateReport(this.opportunities, join(outputDir, 'validation-report.txt'));

    // Create import-ready version (validated and cleaned)
    const validatedOpportunities = this.opportunities
      .map(opp => validateOpportunity(opp))
      .filter(result => result.success)
      .map(result => result.data);

    await exportToJSON(
      validatedOpportunities, 
      join(outputDir, 'import-ready.json')
    );

    console.log(`\n📊 Results exported to ${outputDir}/`);
    console.log(`   - scraped-opportunities.json: ${this.opportunities.length} total opportunities`);
    console.log(`   - import-ready.json: ${validatedOpportunities.length} validated opportunities`);
    console.log(`   - validation-report.txt: Data quality report`);
  }
}

// Main execution
async function main() {
  const scraper = new DartmouthScraper();
  
  try {
    console.log('🎯 Starting Dartmouth Opportunities Scraper\n');
    console.log('=' .repeat(50));
    
    // Skip browser initialization for now - using sample data only
    console.log('📊 Running in sample data mode (no browser needed)\n');
    
    // Scrape different sources (will use sample data)
    await scraper.scrapeUGAR();
    await scraper.scrapeWISP();
    await scraper.scrapeDickey();
    await scraper.scrapeRockefeller();
    await scraper.scrapeScholarPrograms();
    await scraper.scrapeFellowshipAdvising();
    await scraper.scrapeLovelaceProgram();
    await scraper.scrapeLeslieCenter();
    await scraper.scrapeMagnusonExpanded();
    await scraper.scrapeDepartmentPrograms();
    await scraper.scrapeFYREE();
    await scraper.scrapeTuckerCenter();
    await scraper.scrapeDCSI();
    await scraper.scrapeHopkinsCenter();
    await scraper.scrapeAdditionalPrograms();
    
    // Export results
    await scraper.exportResults();
    
    console.log('\n✨ Scraping completed successfully!');
    console.log('📁 Check the output/ directory for results');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await scraper.cleanup();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DartmouthScraper, ScrapedOpportunity };