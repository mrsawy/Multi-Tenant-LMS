import { Actions } from "src/role/enum/Action.enum";
import { Conditions } from "src/role/enum/Conditions.enum";
import { Subjects } from "src/role/enum/subject.enum";
import { AppAbility } from "src/role/permissions.factory";

export function checkConditionForRule(ability: AppAbility, action: Actions, subject: Subjects, Conditions: Conditions) {
    const rules = ability.rules;
    let hasCondition = false;
    const matchedRules = rules.filter(rule => rule.subject === subject && rule.action === action && rule.conditions && rule.conditions[Conditions])
    if (matchedRules.length > 0) {
        hasCondition = true
    }
    return {
        hasCondition,
        conditionValue: matchedRules.length > 0 && matchedRules[0].conditions
            ? matchedRules[0].conditions[Conditions]
            : undefined
    }
}
