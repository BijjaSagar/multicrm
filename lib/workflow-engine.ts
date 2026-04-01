import prisma from './prisma'

/**
 * The Workflow Engine is a server-side event processor that 
 * matches system events (Lead Created, Deal Updated, etc) 
 * against user-defined workflows and executes their actions.
 */
export async function triggerWorkflow(tenantId: string, eventType: string, data: any) {
  try {
    // 1. Find all active workflows for this tenant and trigger type
    const workflows = await prisma.workflow.findMany({
      where: {
        tenantId,
        triggerType: eventType,
        status: 'ACTIVE'
      },
      include: {
        actions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (workflows.length === 0) return

    for (const workflow of workflows) {
      console.log(`[Workflow Engine] Running workflow: ${workflow.name} for event ${eventType}`)
      
      // 2. Check Conditions (triggerConfig)
      // Example: { field: "status", value: "QUALIFIED" }
      if (workflow.triggerConfig) {
        const config = workflow.triggerConfig as any
        if (config.field && config.value) {
          const actualValue = data[config.field]
          if (actualValue !== config.value) {
            console.log(`[Workflow Engine] Skipping: Condition not met (${actualValue} != ${config.value})`)
            continue
          }
        }
      }

      // 3. Execute Actions
      for (const action of workflow.actions) {
        await executeWorkflowAction(tenantId, action, data)
      }

      // 4. Update Execution Stats
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          executionCount: { increment: 1 },
          lastRunAt: new Date()
        }
      })
    }
  } catch (error) {
    console.error('[Workflow Engine] Error processing workflow:', error)
  }
}

async function executeWorkflowAction(tenantId: string, action: any, data: any) {
  const config = action.config as any
  
  switch (action.type) {
    case 'SEND_WHATSAPP':
      console.log(`[Workflow Action] Sending WhatsApp template ${config.templateId} to ${data.phone}`)
      // Integration with WhatsApp Lib for automated messaging
      // Example: await sendWhatsappTemplate(data.phone, config.templateId, { name: data.firstName })
      break

    case 'SEND_EMAIL':
      console.log(`[Workflow Action] Sending Email to ${data.email}`)
      break

    case 'CREATE_NOTIFICATION':
      console.log(`[Workflow Action] Creating notification: ${config.title}`)
      await prisma.notification.create({
        data: {
          userId: data.assignedToId || data.createdById,
          title: config.title || 'Workflow Alert',
          message: config.message || 'An automated workflow was triggered.',
          type: 'INFO'
        }
      })
      break

    case 'UPDATE_FIELD':
      console.log(`[Workflow Action] Updating field ${config.field} to ${config.value}`)
      // Dynamic update logic would go here
      break

    case 'ASSIGN_USER':
      console.log(`[Workflow Action] Assigning to user ${config.userId}`)
      break

    default:
      console.warn(`[Workflow Action] Unknown action type: ${action.type}`)
  }
}
