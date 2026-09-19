// CV PDF, generated from the same data sources as src/pages/cv.astro.
// Compile with: quarto typst compile scripts/cv.typ public/cv.pdf

#let profile = yaml("../src/data/profile.yml")
#let cv = yaml("../src/data/cv.yml")
#let works = json("../src/data/generated/works.json")

#set page(paper: "a4", margin: (x: 2cm, y: 1.8cm))
#set text(font: ("Inter", "Libertinus Serif"), size: 9.5pt, lang: "en")
#set par(justify: false, leading: 0.55em)
#show heading.where(level: 1): it => [
  #set text(size: 13pt, weight: "bold", fill: rgb("#0B2545"))
  #v(0.6em)
  #it.body
  #v(0.2em)
  #line(length: 100%, stroke: 0.5pt + rgb("#0B2545"))
  #v(0.2em)
]
#show heading.where(level: 2): it => [
  #set text(size: 10pt, weight: "bold")
  #v(0.4em)
  #it.body
]

// -- Header -----------------------------------------------------------
#align(center)[
  #text(size: 18pt, weight: "bold", fill: rgb("#0B2545"))[#profile.name] \
  #text(size: 11pt)[#profile.title] \
  #text(size: 9.5pt, fill: rgb("#64748B"))[
    #profile.affiliation
    #if "affiliation_secondary" in profile and profile.affiliation_secondary != none [ \ #profile.affiliation_secondary ]
  ] \
  #text(size: 9pt)[
    #profile.location
    #if profile.socials.email != none and profile.socials.email != "" [ · #profile.socials.email ]
    #if profile.socials.orcid != none and profile.socials.orcid != "" [ · #link(profile.socials.orcid)[ORCID] ]
    #if profile.socials.github != none and profile.socials.github != "" [ · #link(profile.socials.github)[GitHub] ]
    #if profile.socials.linkedin != none and profile.socials.linkedin != "" [ · #link(profile.socials.linkedin)[LinkedIn] ]
  ]
]

#v(0.4em)

// -- Current position ---------------------------------------------------
= Current position
#for p in cv.positions.filter(p => p.end == "present") [
  == #p.title, #p.org
  #text(fill: rgb("#64748B"))[#p.location · #p.start - Present]
  #if "summary" in p and p.summary != none [
    #par()[#p.summary]
  ]
  #if "highlights" in p and p.highlights != none [
    #list(..p.highlights.map(h => [#h]))
  ]
]

// -- Education ------------------------------------------------------------
= Education
#for e in cv.education [
  == #e.degree, #e.field
  #text(fill: rgb("#64748B"))[#e.institution · #e.location · #e.start - #e.end]
  #if "thesis" in e and e.thesis != none [
    #par()[Thesis: #e.thesis]
  ]
  #if "funding" in e and e.funding != none [
    #par()[Funding: #e.funding]
  ]
]

// -- Research experience --------------------------------------------------
= Research experience
#for p in cv.positions.filter(p => p.end != "present") [
  == #p.title, #p.org
  #text(fill: rgb("#64748B"))[#p.location · #p.start - #p.end]
  #if "summary" in p and p.summary != none [
    #par()[#p.summary]
  ]
  #if "highlights" in p and p.highlights != none [
    #list(..p.highlights.map(h => [#h]))
  ]
]

// -- Publications -----------------------------------------------------------
= Publications

#let peer-reviewed = works.publications.filter(p => p.type == "journal-article")
#let by-year = peer-reviewed.fold((:), (acc, p) => {
  let y = str(p.year)
  acc.insert(y, acc.at(y, default: ()) + (p,))
  acc
})
#let sorted-years = by-year.keys().sorted(key: y => -int(y))

#for y in sorted-years [
  == #y
  #list(..by-year.at(y).map(p => [
    #p.title#if p.journal != none [, #emph(p.journal)]#if p.doi != none [ · #link("https://doi.org/" + p.doi)[DOI]]
  ]))
]

#if cv.manuscripts_in_preparation.len() > 0 [
  == Manuscripts in preparation
  #list(..cv.manuscripts_in_preparation.map(m => [#m.title (#m.role, #m.year)]))
]

#if cv.talks.len() > 0 [
  == Talks
  #list(..cv.talks.map(t => [#t.title, #t.venue, #t.year (#t.type)]))
]

// -- Software -----------------------------------------------------------
= Software
#list(..cv.software.map(s => [
  #strong[#s.name], #s.role
  #if "platform" in s and s.platform != none [ · #s.platform]
  #if "note" in s and s.note != none [ · #s.note]
]))

// -- Teaching -----------------------------------------------------------
= Teaching
#list(..cv.teaching.map(t => [
  #strong[#t.title], #t.role · #t.org · #t.period
]))
#if cv.supervision.len() > 0 [
  #list(..cv.supervision.map(s => [Supervised #s.count #s.level students, #s.org, #s.period]))
]

// -- Consortia -----------------------------------------------------------
= Consortia
#list(..cv.consortia.map(c => [
  #strong[#c.name], #c.role · #c.period
  #if "outcome" in c and c.outcome != none [ · #c.outcome]
]))

// -- Awards & memberships -----------------------------------------------
= Awards & memberships
#list(
  ..cv.awards.map(a => [#a.title, #a.org, #a.period]),
  ..cv.memberships.map(m => [#m.name, since #m.since])
)

// -- Certifications and training -------------------------------------------
= Certifications and training
#list(
  ..cv.certifications.map(c => [#c.name, #c.issuer#if "year" in c and c.year != none [, #c.year]]),
  ..cv.training.map(t => [#t.name, #t.org, #t.year])
)

// -- Skills -----------------------------------------------------------
= Skills
#for (key, values) in cv.skills [
  == #key.replace("_", " ")
  #par()[#values.join(", ")]
]

// -- Languages -----------------------------------------------------------
= Languages
#par()[#cv.languages.map(l => l.language + " (" + l.level + ")").join(" · ")]
