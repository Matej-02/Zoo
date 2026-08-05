/* Pocket Zoo Architect — core/validation */
'use strict';

function validateCatalog() {
    const issues = [];
    const enrichmentTypes = new Set(Object.values(HABITAT_OBJECTS).map(item => item.enrichment).filter(Boolean));
    const fenceOptions = Object.values(FENCES);

    for (const [id, plant] of Object.entries(FOLIAGE)) {
        if (!plant.allowedGrounds?.length)
            issues.push(`Foliage ${id} has no allowed terrain.`);
        for (const ground of plant.allowedGrounds || [])
            if (!GROUND[ground])
                issues.push(`Foliage ${id} references unknown terrain ${ground}.`);
    }

    for (const [id, species] of Object.entries(SPECIES)) {
        for (const ground of Object.keys(species.terrain || {}))
            if (!GROUND[ground])
                issues.push(`Species ${id} references unknown terrain ${ground}.`);
        for (const biome of species.biomes || [])
            if (!Object.values(FOLIAGE).some(plant => plant.biome === biome))
                issues.push(`Species ${id} has no foliage available for biome ${biome}.`);
        if (species.requiredFoliage && !FOLIAGE[species.requiredFoliage])
            issues.push(`Species ${id} requires missing foliage ${species.requiredFoliage}.`);
        for (const enrichment of species.enrich || [])
            if (!enrichmentTypes.has(enrichment))
                issues.push(`Species ${id} requires missing enrichment ${enrichment}.`);
        if (!fenceOptions.some(fence => fence.strength >= species.fence.strength && fence.height >= species.fence.height && (!species.fence.waterproof || fence.waterproof)))
            issues.push(`Species ${id} has no valid barrier option.`);
    }

    for (const [id, object] of Object.entries(OBJECTS))
        if (!object.name || !Number.isFinite(object.cost))
            issues.push(`Object ${id} is missing a name or numeric cost.`);

    return issues;
}
