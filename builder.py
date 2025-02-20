"""
/
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
# import json
# import shutil

import bibtexparser  # bibtexparser
import yaml  # pyyaml

ROOT = osp.dirname(__file__)
RECENT_YEAR = 2
PUB_BIB = osp.join(ROOT, "pub.bib")
PUB_YML = osp.join(ROOT, "_data", "publications.yaml")
PUB_JSON = osp.join(ROOT, "_data", "publications.json")
PUB_JSON_WEB = osp.join(ROOT, "assets", "publications.json")

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

CLEAN = ["tags", "author+an", "thumbnail"]

REQUIRE = [
    "author", "booktitle", "title", "year", "abstract", "eprint", # requirement
    "code", "video", "month", # optional
    *CLEAN # supplementary
]

MATCH_DICT = {
    "Text-Generation": ["Text Generation", "generation", "generating", "machine translation"],
    "Drug-Discovery": ["Drug Discovery", "drug", "protein"],
    "Non-Autoregressive-Generation": ["Non-Autoregressive Generation", "non-autoregressive"],
}

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
            pass # TODO: how to highlight student?
        elif type == "highlight":
            author_list[_seq] = f"<b class='highlight'>{author_list[_seq]}</b>"
    if len(author_list) > 1:
        author_list[-1] = f"and {author_list[-1]}"
    return ", ".join(author_list)

def match_tag(entry:dict, tag:str):
    if "title" in entry and entry["title"].find(tag) != -1:
        return True
    elif "abstract" in entry and entry["abstract"].find(tag) != -1:
        return True
    else:
        return False

def tag_by_match(info_dict:dict, idx:int, entry:dict):
    """Search keyword in title and abstract
    """
    for key, val in MATCH_DICT.items():
        if any(match_tag(entry, t) for t in val):
            if key not in info_dict:
                info_dict[key] = []
            info_dict[key].append(idx)

writer = bibtexparser.bwriter.BibTexWriter()
def cleanup_bibtex(parser_entry:dict) -> str:
    for key in CLEAN:
        if key in parser_entry:
            parser_entry.pop(key)

    return writer._entry_to_bibtex(parser_entry)

def update_tags(group:dict[str, list[int]], idx:int, entry:dict, enable_manual:bool=True):
    """Update tags for each entry
    """
    # ignore recent papers
    # if valid_recent(entry["year"], entry.get("month", 1)):
    #     if "recent" not in group:
    #         group["recent"] = []
    #     group["recent"].append(idx)

    if "tags" in entry:
        tag_in_entry = [t.strip() for t in entry["tags"].split(',')]
        for tag in tag_in_entry:
            if tag not in group:
                group[tag] = []
            group[tag].append(idx)
    elif enable_manual:
        tag_by_match(group, idx, entry)
    

def build_pubs(root: str, storage:str):
    with open(root) as fd:
        bib_db = bibtexparser.load(fd)

    entries:list[dict[str, str|int]] = []
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


    tag_group:dict[str, list[int]] = {}
    for idx, entry in enumerate(entries):
        update_tags(tag_group, idx, entry, False)
        entry["author"] = highlight_author(entry["author+an"], entry["author"])

    with open(storage, "w") as fd:
        result = {
            "entries": entries,
            "tags": tag_group,
        }
        # json.dump(result, fd)
        yaml.safe_dump(result, fd, sort_keys=False)




if __name__ == "__main__":
    build_pubs(PUB_BIB, PUB_YML)
    # build_pubs(PUB_BIB, PUB_JSON)
    # shutil.copyfile(PUB_JSON, PUB_JSON_WEB)

