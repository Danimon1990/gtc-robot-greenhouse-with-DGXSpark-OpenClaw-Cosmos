"""
MCP server exposing greenhouse DB tools to LLM agents.
Run with: python -m src.mcp.server
"""

from mcp.server.fastmcp import FastMCP

from src.db import logger

mcp = FastMCP("greenhouse-agent")


@mcp.tool()
def get_latest_sensors() -> dict:
    """Get the most recent greenhouse sensor readings."""
    return logger.get_latest_sensors()


@mcp.tool()
def get_zone_history(zone_id: str, hours: int = 24) -> list:
    """Get time-series moisture/light/status for a zone."""
    return logger.get_zone_history(zone_id, hours)


@mcp.tool()
def get_dry_zones(threshold: float = 30.0) -> list:
    """Return zone IDs where soil moisture is currently below threshold."""
    return logger.get_dry_zones(threshold)


@mcp.tool()
def get_recent_agent_runs(limit: int = 5) -> list:
    """Return the last N Cosmos reasoning runs."""
    return logger.get_recent_runs(limit)


if __name__ == "__main__":
    mcp.run()
