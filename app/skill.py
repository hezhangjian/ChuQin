from typing import Dict

from pydantic import BaseModel


class SkillManifest(BaseModel):
    name: str
    description: str
    metadata: Dict[str, str]
