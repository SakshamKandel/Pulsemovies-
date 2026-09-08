declare module 'adblock-rs' {
    export class FilterSet {
        constructor(debug: boolean);
        addFilters(filters: string): void;
    }

    export interface CosmeticResources {
        hide_selectors: string[];
        procedural_actions: string[];
        exceptions: string[];
        injected_script: string;
        generichide: boolean;
    }

    export class Engine {
        constructor(filterSet: FilterSet);
        check(url: string, sourceUrl: string, resourceType: string, method?: string, fullDetails?: boolean): boolean | any;
        urlCosmeticResources(url: string): CosmeticResources;
        serialize(): ArrayBuffer;
    }

    export default {
        FilterSet,
        Engine,
    };
}
