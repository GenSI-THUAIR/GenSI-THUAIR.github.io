"""
/
- _data
    - pub.bib

YML:
papers:
    entries: # list[dict[str, str]]
        - author
          venue
          title
          year
          paper
          abstract
          bib
          [code]
          [data]
          [slides]
          [video]
          [poster]
    tags: # dict[str, list[int]]
        recent: [] # list[int]
        other_tag:
"""

import os.path as osp
from datetime import datetime

import bibtexparser  # bibtexparser
import yaml  # pyyaml

ROOT = osp.dirname(__file__)
RECENT_YEAR = 2
PUB_BIB = osp.join(ROOT, "_data", "pub.bib")
PUB_YML = osp.join(ROOT, "_data", "publications.yaml")

NOW = datetime.now()
NOW_DATE = NOW.year * 12 + NOW.month
MONTH_DICT = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}


REQUIRE = [
    "author", "booktitle", "title", "year", "abstract", "eprint", # requirement
    "code", "video", "month", # optional
    "author+an", "tag" # supplementary
]

CLEAN = ["tag"]


# "author+an", ,"student"
def get_month_num(month: str) -> int:
    return MONTH_DICT.get(month, 1)

def valid_recent(year:int, month):
    if isinstance(month, str):
        try:
            month = int(month)
        except:
            month = get_month_num(month)
    paper_date = year * 12 + month
    return (NOW_DATE - paper_date) < 24

def highlight_author(info:str, author:str):
    if ';' in info:
        parts = [
            claim.strip().split('=') # id, type
            for claim in info.split(';')
            if not (claim.isspace() or len(claim) == 0)
        ]
    else:
        parts = [info.split('=')]

    author_list = [au.strip() for au in author.split("and")]

    for seq, type in parts:
        _seq = int(seq) - 1
        if type == "student":
            pass # TODO: how to highlight student
        elif type == "highlight":
            author_list[_seq] = f"<b class='highlight'>{author_list[_seq]}</b>"
    if len(author_list) > 1:
        author_list[-1] = f"and {author_list[-1]}"
    return ", ".join(author_list)

def tag_by_match(info_dict:dict, entry:dict):
    pass

writer = bibtexparser.bwriter.BibTexWriter()
def cleanup_bibtex(parser_entry:dict) -> str:
    for key in CLEAN:
        if key in parser_entry:
            parser_entry.pop(key)

    return writer._entry_to_bibtex(parser_entry)

def build_pubs(root: str, yml:str):
    with open(root) as fd:
        bib_db = bibtexparser.load(fd)

    entries = [] # list[dict]
    for entry in bib_db.entries:
        bib = {
            key: entry[key]
            for key in REQUIRE
            if key in entry
        }
        bib["bib"] = cleanup_bibtex(entry)
        bib["year"] = int(bib["year"])
        if "eprint" in bib:
            bib["paper"] = bib.pop("eprint")
        entries.append(bib)


    tag_group = { "recent": [] }
    for idx, entry in enumerate(entries):
        if valid_recent(entry["year"], entry.get("month", 1)):
            tag_group["recent"].append(idx)
        # tag_by_match(tag_group, entry)
        entry["author"] = highlight_author(entry["author+an"], entry["author"])

    with open(yml, "w") as fd:
        yaml.safe_dump({
            "entries": entries,
            "tags": tag_group,
        }, fd)




if __name__ == "__main__":
    build_pubs(PUB_BIB, PUB_YML)

