import { $$, Dom, Component, Utils, IComponentBindings, ComponentOptions, IFieldOption, l, BreadcrumbEvents, QueryEvents, IAnalyticsSimpleFilterMeta, analyticsActionCauseList, IBuildingQueryEventArgs, IDoneBuildingQueryEventArgs, IQuerySuccessEventArgs, IPopulateBreadcrumbEventArgs, Checkbox  } from 'coveo-search-ui';
import { lazyComponent } from '@coveops/turbo-core';
import { ToggleFilterValue } from './ToggleFilterValue';
import { SVGIcons } from './utilities/SVGIcons';

export interface IToggleFilterOptions {
    title?:string;
    field?:IFieldOption;
    truthyValue?: string;
    
}

interface ILabeledCheckboxValue {
  checkbox: HTMLInputElement;
  label: string;
}


/**
* The `ToggleFilter` component displays a toggle switch which the end user can select to filter
* the query results.
*
*/
@lazyComponent
export class ToggleFilter extends Component {
    static ID = 'ToggleFilter';
    static options: IToggleFilterOptions = {
        /**
         * Specifies the field whose values the `ToggleFilter` should output result filters from.
         *
         * Specifying a value for this option is required for the `ToggleFilter` component to work.
         */
        field: ComponentOptions.buildFieldOption({ required: true }),

        /**
         * Specifies the title to display for the `ToggleFilter`.
         *
         * Default value is the localized string for `NoTitle`.
         */
        title: ComponentOptions.buildLocalizedStringOption({ localizedString: () => l('NoTitle') }),
        /**
         * Specifies the truthy value used to toggle ON `ToggleFilter` button.
         *
         * Default value is `true`.
         */
        truthyValue: ComponentOptions.buildStringOption({ defaultValue: 'true' }),
    };

    private toggleCheckbox: ILabeledCheckboxValue;
    private toggleBtn: Dom;
    private toggleLabelElement: Dom;
    private toggleCheckboxElement: Dom;
    private previouslyToggled: string = '';
    private groupByBuilder: ToggleFilterValue;
    private shouldTriggerQuery = true;
    private groupByRequestValues: string[] = [];

    constructor(public element: HTMLElement, public options: IToggleFilterOptions, public bindings: IComponentBindings) {
        super(element, ToggleFilter.ID, bindings);
        this.options = ComponentOptions.initComponentOptions(element, ToggleFilter, options);
        this.element.title = this.options.title;

        this.buildContent();

        this.bind.onRootElement(BreadcrumbEvents.populateBreadcrumb, (args: IPopulateBreadcrumbEventArgs) =>
          this.handlePopulateBreadcrumb(args)
        );
        this.bind.onRootElement(BreadcrumbEvents.clearBreadcrumb, () => this.handleClearBreadcrumb());
        this.bind.onRootElement(QueryEvents.buildingQuery, (args: IBuildingQueryEventArgs) => this.handleBuildingQuery(args));
        this.bind.onRootElement(QueryEvents.doneBuildingQuery, (args: IDoneBuildingQueryEventArgs) => this.handleDoneBuildingQuery(args));
        this.bind.onRootElement(QueryEvents.querySuccess, (args: IQuerySuccessEventArgs) => this.handleQuerySuccess(args));
    }

    private buildContent(){

        this.toggleCheckbox = {
            label: this.options.truthyValue,
            checkbox: <HTMLInputElement> $$('input', { 
                type: 'checkbox', 
                id: `${this.normalizeField(<string>this.options.field)}Checkbox`,
                className: 'coveo-togglefilter-checkbox' }).el
        }

        const labelSpan = $$('span', { 
            className: 'coveo-togglefilter-span-label' 
        }, this.options.title);

        const label = $$('label', {
          className: 'coveo-togglefilter-label',
          for: this.toggleCheckbox.checkbox.id
        });

        this.toggleBtn = $$('div', { 
            className: 'coveo-togglefilter-button'
        }); 

        this.toggleBtn.append(this.toggleCheckbox.checkbox);
        this.toggleBtn.append(label.el);
        this.element.appendChild(labelSpan.el);
        this.element.appendChild(this.toggleBtn.el);

        this.toggleBtn.on('click', (e: Event) => { 
            e.preventDefault();
            this.toggle();
        });

        $$(this.toggleCheckbox.checkbox).on('change', () => this.handleToggle());
        
        this.refreshToggleState();
    }

    private normalizeField(name){
        name = Utils.trim(name);
        if (name[0] == '@') {
            name = name.substr(1);
        }
        return name;
    }

    private handlePopulateBreadcrumb(args: IPopulateBreadcrumbEventArgs) {
        
      if (this.isSelected()) {
        const elem = $$('div', { className: 'coveo-simplefilter-breadcrumb' });
        const title = $$('span', { className: 'coveo-simplefilter-breadcrumb-title' }, `${this.options.title}:`);
        elem.append(title.el);
        const values = $$('span', { className: 'coveo-simplefilter-breadcrumb-values' });
        elem.append(values.el);

        const value = $$('span', { className: 'coveo-simplefilter-breadcrumb-value' }, this.toggleCheckbox.label);
        values.append(value.el);
        const svgContainer = $$('span', { className: 'coveo-simplefilter-breadcrumb-clear' }, SVGIcons.icons.mainClear);
        value.append(svgContainer.el);
        value.el.title = this.toggleCheckbox.label;
        $$(value).on('click', () => this.handleRemoveFromBreadcrumb());

        args.breadcrumbs.push({
          element: elem.el
        });
      }
    }

    private handleRemoveFromBreadcrumb() {
        this.resetCheckbox();
    }

    private handleClearBreadcrumb() {
      // Bit of a hack with that flag, but essentially we want "clear breadcrumb" to be a global, unique event.
      // Not something that will log a special event for SimpleFilter (or any component)
      this.resetWithoutTriggeringQuery();
    }

    /**
     * Toggles the checkbox state.
     */
    public toggle() {
      this.toggleCheckbox.checkbox.checked = !this.isSelected();
      $$(this.toggleCheckbox.checkbox).trigger('change');
    }

    private refreshToggleState() {
        this.toggleBtn.toggleClass('active', this.isSelected());
    }
    private handleToggle() {
        const action = this.isSelected()
          ? analyticsActionCauseList.simpleFilterSelectValue
          : analyticsActionCauseList.simpleFilterDeselectValue;

        if (this.shouldTriggerQuery) {
          this.usageAnalytics.logSearchEvent<IAnalyticsSimpleFilterMeta>(action, {
            simpleFilterTitle: this.options.title,
            simpleFilterSelectedValue: this.toggleCheckbox.label,
            simpleFilterField: <string>this.options.field
          });
          this.queryController.executeQuery();
        }
    }

    private resetWithoutTriggeringQuery() {
      this.shouldTriggerQuery = false;
      this.resetCheckbox();
      this.shouldTriggerQuery = true;
    }

    private handleQuerySuccess(data: IQuerySuccessEventArgs) {
        this.groupByBuilder.groupBy(data);
        this.groupByRequestValues = this.groupByBuilder.getValuesFromGroupBy();
        this.refreshToggleState();
    }

    private handleBuildingQuery(args: IBuildingQueryEventArgs) {

      if (this.isSelected()) {
        args.queryBuilder.advancedExpression.addFieldExpression(this.options.field.toString(), '==', [this.toggleCheckbox.label]);
      }
    }

    private handleDoneBuildingQuery(data: IDoneBuildingQueryEventArgs) {
      this.groupByBuilder = new ToggleFilterValue(this, this.options);
      this.groupByBuilder.handleDoneBuildingQuery(data);
    }

    public getToggleCheckbox() {
        return this.isSelected() ? this.toggleCheckbox.label: null;
    }

    public resetCheckbox() {
        const currentlyChecked = this.isSelected();
        this.toggleCheckbox.checkbox.checked = false;
        if (currentlyChecked) {
          $$(this.toggleCheckbox.checkbox).trigger('change');
        }
    }
    public isSelected() {
        return this.toggleCheckbox.checkbox.checked;
    }
    
}