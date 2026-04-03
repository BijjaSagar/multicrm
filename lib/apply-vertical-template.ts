import { Prisma } from '@prisma/client'
import { VERTICAL_TEMPLATES } from './vertical-templates'

/**
 * Applies a vertical template to a newly created tenant.
 * This should be called within a Prisma transaction.
 */
export async function applyVerticalTemplate(
  tx: Prisma.TransactionClient,
  tenantId: string,
  verticalKey: string
) {
  const template = VERTICAL_TEMPLATES[verticalKey]
  if (!template) return

  // 1. Enable modules
  if (template.modules.length > 0) {
    await tx.tenantModule.createMany({
      data: template.modules.map((key) => ({
        tenantId,
        moduleKey: key,
        isEnabled: true,
      })),
    })
  }

  // 2. Create Default Pipeline and Stages
  const pipeline = await tx.pipeline.create({
    data: {
      tenantId,
      name: `${template.name} Pipeline`,
      isDefault: true,
    },
  })

  if (template.pipelineStages.length > 0) {
    await tx.pipelineStage.createMany({
      data: template.pipelineStages.map((stage, i) => ({
        pipelineId: pipeline.id,
        name: stage.name,
        color: stage.color,
        probability: stage.probability,
        order: i,
        isWon: stage.name.toUpperCase().includes('WON'),
        isLost: stage.name.toUpperCase().includes('LOST'),
      })),
    })
  }

  // 3. Pre-build Custom Fields
  if (template.customFields.length > 0) {
    await tx.customFieldDefinition.createMany({
      data: template.customFields.map((f, i) => ({
        tenantId,
        entityType: f.entityType,
        fieldName: f.fieldName,
        fieldType: f.fieldType,
        options: f.options ? JSON.stringify(f.options) : null,
        isRequired: f.isRequired,
        displayOrder: i,
      })),
    })
  }
}
