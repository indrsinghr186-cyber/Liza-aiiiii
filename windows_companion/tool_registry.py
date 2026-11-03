"""
LIZA AI — Windows 11 Allowlisted Tool Registry
Designed for Dell Latitude 7420 (Owner: Paramveer Rawat)
Enforces strict security boundaries: no arbitrary PowerShell execution.
All actions must match explicit registered tool handlers.
"""

from typing import Dict, Any, Callable, List, Optional
import os
import subprocess
import urllib.parse


class ToolDefinition:
    def __init__(
        self,
        name: str,
        description: str,
        category: str,
        parameters: Dict[str, Any],
        handler: Callable[..., Any],
        requires_confirmation: bool = False
    ):
        self.name = name
        self.description = description
        self.category = category
        self.parameters = parameters
        self.handler = handler
        self.requires_confirmation = requires_confirmation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "parameters": self.parameters,
            "requires_confirmation": self.requires_confirmation
        }


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register(
        self,
        name: str,
        description: str,
        category: str,
        parameters: Dict[str, Any],
        requires_confirmation: bool = False
    ):
        """Decorator to register a validated tool function."""
        def decorator(fn: Callable[..., Any]):
            tool = ToolDefinition(
                name=name,
                description=description,
                category=category,
                parameters=parameters,
                handler=fn,
                requires_confirmation=requires_confirmation
            )
            self._tools[name] = tool
            return fn
        return decorator

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, Any]]:
        return [tool.to_dict() for tool in self._tools.values()]

    def execute(self, name: str, params: Dict[str, Any], confirmed: bool = False) -> Dict[str, Any]:
        """Safely executes an allowlisted tool with parameter validation."""
        tool = self.get_tool(name)
        if not tool:
            return {"success": False, "error": f"Tool '{name}' is not in the allowlisted tool registry."}

        if tool.requires_confirmation and not confirmed:
            return {
                "success": False,
                "requires_confirmation": True,
                "message": f"Action '{name}' requires explicit user confirmation before execution."
            }

        try:
            result = tool.handler(**params)
            return {"success": True, "result": result}
        except TypeError as te:
            return {"success": False, "error": f"Invalid arguments for tool '{name}': {str(te)}"}
        except Exception as e:
            return {"success": False, "error": f"Execution error in tool '{name}': {str(e)}"}


# Global Tool Registry Instance
tool_registry = ToolRegistry()
