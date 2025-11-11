# EnergyGenius - Project Overview

## Project Summary

**Name**: EnergyGenius
**Type**: Greenfield Cloudflare Workers + React SPA
**Level**: 1 (Level 1 greenfield feature build)
**Track**: Quick Flow

## Description

A demo application showcasing AI-powered energy plan recommendations using Cloudflare Workers, Workers AI, and React. The system guides users through an intake form, processes their energy usage data through a multi-stage AI pipeline, and delivers personalized recommendations with savings explanations.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Frontend**: React SPA with Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **AI**: Workers AI (Llama 3.3 70B)
- **Language**: TypeScript
- **Tooling**: Wrangler CLI

## Key Features

1. **Intake Form**: Manual entry or one-click mock data generation
2. **AI Pipeline**: Three-stage processing (Usage Summary → Plan Scoring → Narrative Generation)
3. **Progress Visualization**: Real-time timeline showing AI stage progression
4. **Recommendation Display**: Top 3 personalized plans with savings and explanations
5. **Progressive Enhancement**: Phase 1 (standard POST) with optional Phase 2 (SSE streaming)

## Architecture

- Static assets served via Workers `[assets]` binding
- API endpoint `/api/recommend` orchestrates AI pipeline
- Mock data (supplier catalog + usage scenarios) bundled as TypeScript modules
- Complete flow runs in 15-20 seconds with visible progress feedback

## Documentation

- **Tech Spec**: `./docs/tech-spec.md`
- **Original PRD**: `./PRD_Arbor_AI_Energy_Plan_Recommendation_Agent.md`
- **Workflow Status**: `./docs/bmm-workflow-status.yaml`
- **Orchestration Log**: `./docs/orchestration-flow.md`

## Current Phase

Phase 2: Implementation (Sprint Planning → Story Development)
