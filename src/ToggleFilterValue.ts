import { ToggleFilter, IToggleFilterOptions } from './ToggleFilter';
import { IDoneBuildingQueryEventArgs, IQuerySuccessEventArgs, QueryBuilder, IGroupByRequest } from 'coveo-search-ui';

export class ToggleFilterValue {
  private groupByRequestValues: string[] = [];
  private position: number;

  constructor(public toggleFilter: ToggleFilter, public options: IToggleFilterOptions) {}

  public getValuesFromGroupBy(): string[] {
    return this.groupByRequestValues;
  }

  public groupBy(data: IQuerySuccessEventArgs) {
    this.groupByRequestValues = [];
    const groupByResult = data.results.groupByResults;
    if (groupByResult.length > 0 && this.position != undefined) {
      _.each(groupByResult[this.position].values, value => {
        if (this.groupByRequestValues.indexOf(value.lookupValue) < 0) {
          this.groupByRequestValues.push(value.lookupValue);
        }
      });
    }
  }

  public handleDoneBuildingQuery(data: IDoneBuildingQueryEventArgs) {
    const queryBuilder = data.queryBuilder;
    this.putGroupByIntoQueryBuilder(queryBuilder);
  }

  private putGroupByIntoQueryBuilder(queryBuilder: QueryBuilder) {
    const groupByRequest = this.createBasicGroupByRequest();
    queryBuilder.groupByRequests.push(groupByRequest);
    this.position = queryBuilder.groupByRequests.length - 1;
  }

  private createBasicGroupByRequest(): IGroupByRequest {
    let groupByRequest: IGroupByRequest = {
      field: <string>this.options.field,
      injectionDepth: 1000,
    };
    return groupByRequest;
  }
}