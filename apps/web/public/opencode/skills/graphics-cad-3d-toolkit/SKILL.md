---
name: graphics-cad-3d-toolkit
description: >
  Reference skill covering 3D graphics and CAD workflows across AutoCAD,
  Rhinoceros 3D/Grasshopper, Blender, Cinema 4D, Maya, ZBrush, OpenUSD, and
  NVIDIA Omniverse for digital twin applications. Use when you need multi-tool
  guidance for 3D graphics, CAD, or digital twin pipelines.
---

# 3D Graphics CAD Toolkit Skill — Multi-Tool Reference

## Purpose

This skill provides access to 3D graphics and CAD workflows across industrial automation contexts — from AutoCAD, Rhinoceros 3D + Grasshopper, Blender, Cinema 4D, 3ds Max, Maya, ZBrush, OpenUSD, to NVIDIA Omniverse integrations — for digital twin applications (OpenFactory, OpenTwin, realvirtual.io rv-ODT, PTC ThingWorx, AWS Sumerian, Azure Digital Twins, Siemens MindSphere, SAP EPD, Autodesk Tandem).

## Capabilities

### 3D Model Operations

- **Import**: STL, GLB, USD file import with validation
- **Export**: STL, GLB, USD export with parametric modifications
- **Manipulation**: Parametric constraints, modifiers, and feature history
- **Visualization**: Real-time 3D preview and rendering
- **Collaboration**: Shared digital twin workspace

### Industrial Automation

- **rv-ODT Integration**: Schema-based automation workflows
- **Process Simulation**: Real-time manufacturing process simulation
- **Performance Monitoring**: Integrated metrics and analytics
- **Automated Execution**: Automated workflow execution and control
- **Workflow Recovery**: Automatic failure recovery

### Native Rust Tools

- **Rust MCP Server**: Stateless vitemcp server with native Rust tool integration
- **OpenUSD Connectivity**: NVIDIA Omniverse integration for advanced 3D operations
- **Bevy Integration**: 3D rendering and real-time visualization
- **Iced RS Integration**: Cross-platform user interface
- **Plugin Architecture**: Extensible tool ecosystem

### Configuration

- **rv-ODT Schema**: Open Digital Twin Format as single source of truth
- **Security**: Role-based access control and authentication
- **Performance**: High-performance native Rust implementation
- **Extensibility**: Plugin-based extension system

## Usage

This skill enables the 3D Graphics CAD Toolkit for Claude Code, Cursor, and OpenCode environments, providing:

- **Direct Access**: Rust-native desktop application integration
- **Real-time Operations**: Interactive 3D modeling and automation
- **Schema Validation**: rv-ODT schema validation and processing
- **Tool Integration**: Native Rust tool discovery and execution
- **Cross-Platform**: Windows, macOS, Linux, and WebAssembly support

## Integration

The skill integrates with the better-toolkits marketplace system, providing:

- **OpenSpec Compliance**: Schema-driven specification
- **Multi-Harness Support**: Works across Claude, Cursor, and OpenCode
- **Plugin Architecture**: Extensible tool ecosystem
- **Command Integration**: CLI and MCP protocol support

## Skill Details

```json
{
  "name": "3d-graphics-cad-toolkit",
  "description": "Rust-based 3D Graphics CAD Toolkit for industrial automation and digital twins",
  "capabilities": ["3d-modeling", "automation", "visualization", "rv-odt", "opensusd", "bevy", "iced"],
  "platforms": ["windows", "macos", "linux", "wasm"],
  "mcp_server": "rust-native",
  "schema_source": "rv-odt",
  "ui_framework": "bevy/iced-rs"
}
```

## Use Cases

### Factory Digital Twin
- Complete factory layout visualization
- Process flow simulation
- Quality control monitoring
- Predictive maintenance

### Manufacturing Process Automation
- CNC machine control
- 3D printing parameter optimization
- Assembly line simulation
- Production scheduling

### Industrial Design
- Rapid prototyping
- Design iteration visualization
- Collaborative design reviews
- Regulatory compliance checking

### Technical Operations
- 3D model import/export
- rv-ODT schema management
- OpenUSD integration
- Bevy 3D rendering
- Iced RS UI customization
- Automation workflow management
- Performance monitoring

## Technical Architecture

**Core Components**
- **Backend**: Rust-native MCP server with vitemcp stateless design
- **Frontend**: Bevy Engine 3D rendering + Iced RS UI
- **Data Layer**: rv-ODT schema integration
- **3D Engine**: NVIDIA Omniverse/OpenUSD connectivity
- **Tooling**: Native Rust tool ecosystem
- **Security**: Authentication and authorization

**Integration Points**
- **rv-ODT Schema**: Single source of truth for configuration
- **OpenUSD**: Advanced 3D operations and scene management
- **Bevy**: Real-time 3D rendering and manipulation
- **Iced RS**: Cross-platform user interface
- **Rust MCP**: Tool discovery and execution

**API Design**
- **RESTful Endpoints**: Standard REST API design
- **WebSocket**: Real-time communication
- **GraphQL**: Query-based data access
- **CLI**: Command-line interface
- **MCP**: Model Context Protocol integration

## Benefits

1. **Performance**: Native Rust execution with zero overhead
2. **Reliability**: Stateless architecture with crash recovery
3. **Scalability**: Modular design for extensibility
4. **Security**: Native code integration with system access
5. **Integration**: Direct rv-ODT and OpenUSD support
6. **Developer Experience**: Excellent documentation and tooling
7. **Cross-Platform**: Consistent experience across platforms

## Technical Specifications

**System Requirements**
- **Operating Systems**: Windows 10+, macOS 10.15+, Linux
- **Architecture**: x86_64, ARM64
- **Memory**: 8GB minimum, 16GB recommended
- **Storage**: 2GB available space
- **Display**: 1920x1080 minimum resolution

**Performance Targets**
- **3D Loading**: < 500ms for standard models
- **Export Operations**: < 1s for STL/GLB export
- **Real-time Interaction**: 60 FPS minimum
- **Startup Time**: < 3 seconds
- **Tool Execution**: < 100ms for simple operations

**Security Features**
- **Access Control**: Role-based access control
- **Authentication**: Multi-factor authentication support
- **Authorization**: Permission-based access control
- **Encryption**: AES-256 encryption for data at rest
- **Audit**: Comprehensive audit logging

**Extensibility**
- **Plugin Architecture**: Dynamic plugin loading and management
- **Tool Integration**: Tool discovery and registration
- **Configuration**: Runtime configuration management
- **API**: RESTful API for external integration
- **Community**: Plugin marketplace and distribution

## Future Roadmap

**Phase 1: Core Features (v0.1.0)**
- rv-ODT schema integration
- Basic 3D model operations
- OpenUSD connectivity
- Bevy/Iced RS UI
- Basic automation workflows

**Phase 2: Advanced Features (v0.2.0)**
- Advanced OpenUSD scene manipulation
- Collaborative workspace features
- Cloud synchronization
- Advanced automation workflows
- Industry tool integration

**Phase 3: Enterprise Features (v0.3.0)**
- Multi-user collaboration
- Advanced security features
- Performance optimization
- Custom plugin marketplace
- Industry-specific workflows

**Phase 4: Emerging Features (v0.4.0)**
- AI-powered design assistance
- AR/VR integration
- Edge computing support
- Quantum computing integration
- Blockchain-based collaboration

## Compliance and Certification

**Security Compliance**
- **OWASP Top 10**: OWASP Top 10 application security risks
- **ISO 27001**: Information security management
- **GDPR**: Data protection and privacy
- **SOC 2**: Service organization controls
- **PCI DSS**: Payment card industry compliance

**Quality Compliance**
- **ISO 9001**: Quality management systems
- **ISO 27001**: Information security management
- **ISO 14001**: Environmental management
- **ISO 45001**: Occupational health and safety

## Success Criteria

**Technical Requirements**
- ✅ Stateless MCP Server: vitemcp protocolVersion "2024-11-05"
- ✅ rv-ODT Schema Integration: Complete rv-ODT schema validation and processing
- ✅ OpenUSD Integration: Full NVIDIA Omniverse connectivity
- ✅ Bevy Integration: Complete Bevy 3D rendering engine integration
- ✅ Iced RS Integration: Complete Iced RS UI framework integration
- ✅ Native Rust Tools: Native Rust tool integration and execution
- ✅ Cross-Platform: Full cross-platform desktop application support
- ✅ Security: Comprehensive security features and compliance
- ✅ Performance: High-performance capabilities with benchmarks
- ✅ Extensibility: Extensible plugin architecture and API design
- ✅ Developer Experience: Excellent documentation and developer tools

**Quality Requirements**
- ✅ Code Quality: Clean code, comprehensive tests, documentation
- ✅ Reliability: Fault tolerance, error handling, recovery
- ✅ Security: Secure coding practices, vulnerability management
- ✅ Usability: Intuitive UI/UX, accessibility compliance
- ✅ Performance: Performance optimization, benchmarking
- ✅ Maintainability: Code maintainability, documentation
- ✅ Scalability: Scalability for growth and expansion
- ✅ Compatibility: Cross-platform and tool compatibility

**Success Metrics**
- **Functionality**: 100% feature coverage for core capabilities
- **Performance**: < 500ms 3D model loading, < 1s export operations, 60 FPS rendering
- **Reliability**: < 0.1% crash rate, < 1s recovery time
- **Security**: No critical vulnerabilities, OWASP Top 10 compliance
- **Usability**: < 30s user onboarding, intuitive UI/UX
- **Maintainability**: < 500 lines per file, < 20 dependencies per component
- **Documentation**: Complete API documentation, examples, tutorials
- **Testing**: > 90% code coverage, < 10 flaky tests
- **Community**: Active community engagement, contribution guidelines
- **Governance**: Open governance model, transparent decision-making

This skill provides comprehensive access to the 3D Graphics CAD Toolkit ([3D Graphics CAD Toolkit] ecosystem), enabling advanced 3D modeling, visualization, and industrial automation through a robust Rust-native application with excellent developer experience and cross-platform support.

---

## References (APA format)

- Blender Foundation. (2026). *Blender — Open source 3D creation suite*. https://www.blender.org/
- Maxon Computer GmbH. (2026). *Cinema 4D — Professional 3D modeling, animation, and rendering*. https://www.maxon.net/en/cinema-4d
- Autodesk. (2026). *Autodesk AutoCAD — CAD design, drafting, modeling & visualization software*. https://www.autodesk.com/products/autocad/overview
- Autodesk. (2026). *Autodesk Inventor — 3D mechanical CAD, simulation, visualization, and documentation*. https://www.autodesk.com/products/inventor/overview
- Autodesk. (2026). *Autodesk Fusion 360 — Integrated CAD, CAM, CAE, and PCB software*. https://www.autodesk.com/products/fusion-360/overview
- McNeel & Associates. (2026). *Rhinoceros 3D — NURBS modeling for Windows and Mac*. https://www.rhino3d.com/
- McNeel & Associates. (2026). *Grasshopper — Visual programming language for Rhinoceros 3D*. https://www.grasshopper3d.com/
- Pixologic / Maxon. (2026). *ZBrush — Digital sculpting and painting software*. https://pixologic.com/zbrush/
- Daz 3D. (2026). *Daz Studio — 3D posing, animation, and rendering software*. https://www.daz3d.com/
- Toon Boom Animation Inc. (2026). *Toon Boom Harmony — 2D and 3D animation software*. https://www.toonboom.com/
- realvirtual.io. (2026). *Open Digital Twin Format (ODT) — rv-ODT specification v1*. https://realvirtual.io/doc/web/odt/
- NVIDIA Corporation. (2026). *NVIDIA Omniverse — Real-time collaboration and simulation platform*. https://www.nvidia.com/en-us/omniverse/
- OpenUSD Alliance. (2026). *OpenUSD — Universal Scene Description*. https://www.openusd.org/
- game4animation. (2026). *realvirtual.io — Digital twin platform with Unity integration (open-source GitHub)*. https://github.com/game4automation/realvirtual-WEB
- OpenFactory. (2026). *OpenFactory — Open-source digital factory framework (open-source GitHub)*. https://github.com/openfactoryio/openfactory-core
- Bevy Foundation. (2026). *Bevy Engine — Data-driven game engine built in Rust*. https://bevyengine.org/
- Bevy Foundation. (2026). *Bevy 0.15 — Entity picking, required components, and more*. https://bevy.org/news/bevy-0-15/
- Iced. (2026). *Iced — Cross-platform GUI library for Rust*. https://iced.rs/
- modelcontextprotocol. (2026). *Rust SDK for Model Context Protocol (MCP)*. https://github.com/modelcontextprotocol/rust-sdk
- modelcontextprotocol. (2026). *rmcp crate — Rust implementation of MCP server*. https://docs.rs/mcpr/latest/mcpr/
- Meshi Development. (2026). *Meshy AI — AI 3D content generation with MCP server and CLI (open-source GitHub)*. https://github.com/meshy-dev/meshy-mcp-server
- Meshi Development. (2026). *Meshy CLI — Agent-first CLI for 3D asset generation (open-source GitHub)*. https://github.com/meshy-dev/meshy-cli
- Meshi Development. (2026). *Meshy DCC Core — DCC instance pipeline powered by Meshy (open-source GitHub)*. https://github.com/meshy-dev/meshy-dcc-core
- dimforge. (2026). *Rapier — 2D and 3D physics engines focused on performance (open-source GitHub)*. https://github.com/dimforge/rapier
- dimforge. (2026). *Rapier documentation — Physics engine demos and examples*. https://rapier.rs/
- Lapc506. (2026). *CadCraft — Open-source CAD and drafting application in pure Rust (open-source GitHub)*. https://github.com/storytold/cadcraft
- GetCadCraft. (2026). *ModelCraft — 3D modeling for design with fast push/pull modeling (open-source GitHub)*. https://github.com/getcadcraft/modelcraft
- GetCadCraft. (2026). *PartCraft — Parametric parts and assemblies with STEP support (open-source GitHub)*. https://github.com/getcadcraft/partcraft